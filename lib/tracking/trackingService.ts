import { prisma } from '@/lib/prisma';
import {
  getTrackingInfo,
  getBatchTrackingInfo,
  isCacheExpired,
  type TrackingInfo,
} from './17track';

/**
 * Get tracking info from cache or API
 * Returns cached data if fresh (< 6 hours), otherwise fetches from API
 */
export async function getOrUpdateTracking(
  trackNumber: string,
  serviceName: string = 'AliExpress'
): Promise<TrackingInfo | null> {
  const apiKey = process.env.TRACK17_API_KEY;

  if (!apiKey) {
    console.warn('TRACK17_API_KEY not configured, tracking disabled');
    return null;
  }

  try {
    // Check if we have cached data
    const cached = await prisma.trackingCache.findUnique({
      where: { trackNumber },
    });

    // If cache exists and is fresh, return it
    if (cached && !isCacheExpired(cached.lastUpdated)) {
      return {
        trackNumber: cached.trackNumber,
        carrier: (cached.trackingData as any).carrier || 'Unknown',
        status: (cached.trackingData as any).status || 'unknown',
        isDelivered: cached.isDelivered,
        events: (cached.trackingData as any).events || [],
        lastUpdate: cached.lastUpdated,
      };
    }

    // Cache is expired or doesn't exist, fetch from API
    const trackingInfo = await getTrackingInfo(trackNumber, apiKey);

    if (!trackingInfo) {
      return null;
    }

    // Update or create cache
    await prisma.trackingCache.upsert({
      where: { trackNumber },
      update: {
        trackingData: trackingInfo as any,
        isDelivered: trackingInfo.isDelivered,
        lastUpdated: new Date(),
      },
      create: {
        trackNumber,
        serviceName,
        trackingData: trackingInfo as any,
        isDelivered: trackingInfo.isDelivered,
      },
    });

    return trackingInfo;
  } catch (error) {
    console.error(`Error in getOrUpdateTracking for ${trackNumber}:`, error);
    return null;
  }
}

/**
 * Update tracking info for a specific alias status
 */
export async function updateAliasTrackingStatus(
  aliasId: string,
  serviceName: string,
  trackNumber: string
): Promise<boolean> {
  try {
    const trackingInfo = await getOrUpdateTracking(trackNumber, serviceName);

    if (!trackingInfo) {
      return false;
    }

    // Update alias status with tracking info
    const alias = await prisma.alias.findUnique({
      where: { id: aliasId },
    });

    if (!alias) {
      return false;
    }

    const status = alias.status as any;

    // Update service status with delivery info
    if (status[serviceName]) {
      status[serviceName] = {
        ...status[serviceName],
        isDelivered: trackingInfo.isDelivered,
        trackingStatus: trackingInfo.status,
        lastTrackingUpdate: trackingInfo.lastUpdate.toISOString(),
      };

      await prisma.alias.update({
        where: { id: aliasId },
        data: { status },
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error updating alias tracking status:`, error);
    return false;
  }
}

/**
 * Update all tracking numbers for a specific service
 * This is called periodically or when user logs in
 */
export async function updateAllTrackingForService(
  serviceName: string = 'AliExpress'
): Promise<{
  updated: number;
  failed: number;
}> {
  const apiKey = process.env.TRACK17_API_KEY;

  if (!apiKey) {
    console.warn('TRACK17_API_KEY not configured, tracking disabled');
    return { updated: 0, failed: 0 };
  }

  try {
    // Find all aliases with the service and TrackNumber
    const aliases = await prisma.alias.findMany();

    // Extract track numbers that need updating
    const trackNumbersToUpdate: Array<{
      aliasId: string;
      trackNumber: string;
    }> = [];

    for (const alias of aliases) {
      const status = alias.status as any;
      const serviceData = status[serviceName];

      if (serviceData?.TrackNumber && !serviceData.isDelivered) {
        // Check if cache needs update
        const cached = await prisma.trackingCache.findUnique({
          where: { trackNumber: serviceData.TrackNumber },
        });

        if (!cached || isCacheExpired(cached.lastUpdated)) {
          trackNumbersToUpdate.push({
            aliasId: alias.id,
            trackNumber: serviceData.TrackNumber,
          });
        }
      }
    }

    if (trackNumbersToUpdate.length === 0) {
      return { updated: 0, failed: 0 };
    }

    // Batch fetch tracking info
    const trackNumbers = trackNumbersToUpdate.map((t) => t.trackNumber);
    const trackingInfoMap = await getBatchTrackingInfo(trackNumbers, apiKey);

    let updated = 0;
    let failed = 0;

    // Update each alias
    for (const { aliasId, trackNumber } of trackNumbersToUpdate) {
      const trackingInfo = trackingInfoMap.get(trackNumber);

      if (!trackingInfo) {
        failed++;
        continue;
      }

      // Update cache
      await prisma.trackingCache.upsert({
        where: { trackNumber },
        update: {
          trackingData: trackingInfo as any,
          isDelivered: trackingInfo.isDelivered,
          lastUpdated: new Date(),
        },
        create: {
          trackNumber,
          serviceName,
          trackingData: trackingInfo as any,
          isDelivered: trackingInfo.isDelivered,
        },
      });

      // Update alias
      const alias = await prisma.alias.findUnique({
        where: { id: aliasId },
      });

      if (alias) {
        const status = alias.status as any;
        if (status[serviceName]) {
          status[serviceName] = {
            ...status[serviceName],
            isDelivered: trackingInfo.isDelivered,
            trackingStatus: trackingInfo.status,
            lastTrackingUpdate: trackingInfo.lastUpdate.toISOString(),
          };

          await prisma.alias.update({
            where: { id: aliasId },
            data: { status },
          });

          updated++;
        }
      }
    }

    return { updated, failed };
  } catch (error) {
    console.error(`Error in updateAllTrackingForService:`, error);
    return { updated: 0, failed: 0 };
  }
}

/**
 * Check if any tracking data needs updating on user login
 */
export async function checkAndUpdateTrackingOnLogin(): Promise<void> {
  const apiKey = process.env.TRACK17_API_KEY;

  if (!apiKey) {
    return;
  }

  try {
    // Find tracking cache entries that are expired
    const expiredEntries = await prisma.trackingCache.findMany({
      where: {
        isDelivered: false, // Only update non-delivered packages
      },
    });

    const needsUpdate = expiredEntries.filter((entry) =>
      isCacheExpired(entry.lastUpdated)
    );

    if (needsUpdate.length === 0) {
      return;
    }

    console.log(
      `Updating ${needsUpdate.length} expired tracking entries on login`
    );

    // Update in background
    updateAllTrackingForService('AliExpress').catch((error) =>
      console.error('Background tracking update failed:', error)
    );
  } catch (error) {
    console.error('Error checking tracking on login:', error);
  }
}
