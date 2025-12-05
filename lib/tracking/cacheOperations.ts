/**
 * Tracking cache operations
 */

import { prisma } from '@/lib/prisma';
import { TrackingInfo } from './types';

/**
 * Get tracking info from cache
 */
export async function getCachedTracking(
  trackNumber: string
): Promise<TrackingInfo | null> {
  const cached = await prisma.trackingCache.findUnique({
    where: { trackNumber },
  });

  if (!cached) return null;

  const data = cached.trackingData as {
    carrier?: string;
    status?: string;
    events?: TrackingInfo['events'];
  };

  return {
    trackNumber: cached.trackNumber,
    carrier: data.carrier || 'Unknown',
    status: data.status || 'unknown',
    isDelivered: cached.isDelivered,
    events: data.events || [],
    lastUpdate: cached.lastUpdated,
  };
}

/**
 * Convert tracking info to JSON-safe format
 */
function toTrackingDataJson(trackingInfo: TrackingInfo): object {
  return {
    carrier: trackingInfo.carrier,
    status: trackingInfo.status,
    isDelivered: trackingInfo.isDelivered,
    events: trackingInfo.events,
    lastUpdate: trackingInfo.lastUpdate.toISOString(),
  };
}

/**
 * Update or create tracking cache entry
 */
export async function upsertTrackingCache(
  trackNumber: string,
  serviceName: string,
  trackingInfo: TrackingInfo
): Promise<void> {
  const trackingData = toTrackingDataJson(trackingInfo);

  await prisma.trackingCache.upsert({
    where: { trackNumber },
    update: {
      trackingData,
      isDelivered: trackingInfo.isDelivered,
      lastUpdated: new Date(),
    },
    create: {
      trackNumber,
      serviceName,
      trackingData,
      isDelivered: trackingInfo.isDelivered,
    },
  });
}
