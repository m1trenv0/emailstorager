import { prisma } from '@/lib/prisma';
import {
  getTrackingInfo,
  getBatchTrackingInfo,
  isCacheExpired,
  type TrackingInfo,
} from './17track';
import { TrackNumberEntry, TrackingUpdateResult, ServiceStatus } from './serviceTypes';
import { getCachedTracking, upsertTrackingCache } from './cacheOperations';
import { updateAliasTracking, updateAccountTracking } from './entityUpdates';

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
    const cached = await getCachedTracking(trackNumber);

    // If cache exists and (is fresh OR is delivered), return it
    if (cached && (!isCacheExpired(cached.lastUpdate) || cached.isDelivered)) {
      return cached;
    }

    // Cache is expired or doesn't exist, fetch from API
    const trackingInfo = await getTrackingInfo(trackNumber, apiKey);

    if (!trackingInfo) {
      return null;
    }

    // Update cache
    await upsertTrackingCache(trackNumber, serviceName, trackingInfo);

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

    return updateAliasTracking(aliasId, serviceName, trackingInfo);
  } catch (error) {
    console.error(`Error updating alias tracking status:`, error);
    return false;
  }
}

/**
 * Check if entity needs tracking update
 */
function needsTrackingUpdate(serviceData: ServiceStatus): boolean {
  return !serviceData.isDelivered || !!serviceData.trackingError;
}

/**
 * Collect track numbers from aliases that need updating
 */
async function collectAliasTrackNumbers(
  serviceName: string
): Promise<TrackNumberEntry[]> {
  const entries: TrackNumberEntry[] = [];
  const aliases = await prisma.alias.findMany();

  for (const alias of aliases) {
    const status = alias.status as Record<string, ServiceStatus>;
    const serviceData = status[serviceName];

    if (!serviceData?.TrackNumber) continue;
    if (!needsTrackingUpdate(serviceData)) continue;

    const cached = await prisma.trackingCache.findUnique({
      where: { trackNumber: serviceData.TrackNumber },
    });

    if (!cached || (isCacheExpired(cached.lastUpdated) && !cached.isDelivered)) {
      entries.push({
        id: alias.id,
        type: 'alias',
        trackNumber: serviceData.TrackNumber,
      });
    }
  }

  return entries;
}

/**
 * Collect track numbers from accounts that need updating
 */
async function collectAccountTrackNumbers(
  serviceName: string
): Promise<TrackNumberEntry[]> {
  const entries: TrackNumberEntry[] = [];
  const accounts = await prisma.account.findMany();

  for (const account of accounts) {
    const status = account.status as Record<string, ServiceStatus>;
    const serviceData = status[serviceName];

    if (!serviceData?.TrackNumber) continue;
    if (!needsTrackingUpdate(serviceData)) continue;

    const cached = await prisma.trackingCache.findUnique({
      where: { trackNumber: serviceData.TrackNumber },
    });

    if (!cached || (isCacheExpired(cached.lastUpdated) && !cached.isDelivered)) {
      entries.push({
        id: account.id,
        type: 'account',
        trackNumber: serviceData.TrackNumber,
      });
    }
  }

  return entries;
}

/**
 * Update all tracking numbers for a specific service
 * This is called periodically or when user logs in
 */
export async function updateAllTrackingForService(
  serviceName: string = 'AliExpress'
): Promise<TrackingUpdateResult> {
  const apiKey = process.env.TRACK17_API_KEY;

  if (!apiKey) {
    console.warn('TRACK17_API_KEY not configured, tracking disabled');
    return { updated: 0, failed: 0 };
  }

  try {
    // Collect track numbers that need updating
    const aliasEntries = await collectAliasTrackNumbers(serviceName);
    const accountEntries = await collectAccountTrackNumbers(serviceName);
    const trackNumbersToUpdate = [...aliasEntries, ...accountEntries];

    if (trackNumbersToUpdate.length === 0) {
      return { updated: 0, failed: 0 };
    }

    // Batch fetch tracking info
    const trackNumbers = trackNumbersToUpdate.map((t) => t.trackNumber);
    const trackingInfoMap = await getBatchTrackingInfo(trackNumbers, apiKey);

    let updated = 0;
    let failed = 0;

    // Update each entry
    for (const { id, type, trackNumber } of trackNumbersToUpdate) {
      const trackingInfo = trackingInfoMap.get(trackNumber);

      if (!trackingInfo) {
        failed++;
        continue;
      }

      // Update cache
      await upsertTrackingCache(trackNumber, serviceName, trackingInfo);

      // Update entity
      const success =
        type === 'alias'
          ? await updateAliasTracking(id, serviceName, trackingInfo)
          : await updateAccountTracking(id, serviceName, trackingInfo);

      if (success) {
        updated++;
      } else {
        failed++;
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
 * This includes both expired cache and new packages without cache
 */
export async function checkAndUpdateTrackingOnLogin(): Promise<void> {
  const apiKey = process.env.TRACK17_API_KEY;

  if (!apiKey) {
    return;
  }

  try {
    updateAllTrackingForService('AliExpress').catch((error) =>
      console.error('Background tracking update failed:', error)
    );
  } catch (error) {
    console.error('Error checking tracking on login:', error);
  }
}
