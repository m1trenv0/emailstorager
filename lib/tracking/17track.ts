/**
 * 17TRACK API Integration
 * Documentation: https://api.17track.net/en/doc
 *
 * Workflow:
 * 1. Register tracking number (if not already registered)
 * 2. Get tracking info
 */

import {
  TrackingInfo,
  TrackingEvent,
  TrackingInfoResponse,
  TrackData,
  TRACK17_API_URL,
  SIX_HOURS_MS,
  BATCH_SIZE,
  REGISTRATION_DELAY_MS,
  BATCH_DELAY_MS,
  POST_REGISTRATION_DELAY_MS,
} from './types';
import { registerTracking, registerTrackingBatch } from './registration';
import { calculateStatusAndDelivery } from './statusCalculator';
import { parseTrackingEvents } from './eventParser';

// Re-export types for external usage
export type { TrackingEvent, TrackingInfo } from './types';

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch tracking info from 17TRACK API
 */
async function fetchTrackingInfo(
  trackNumber: string,
  apiKey: string
): Promise<TrackingInfoResponse | null> {
  const response = await fetch(`${TRACK17_API_URL}gettrackinfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      '17token': apiKey,
    },
    body: JSON.stringify([{ number: trackNumber }]),
  });

  if (!response.ok) {
    console.error(
      `17TRACK API error: ${response.status} ${response.statusText}`
    );
    return null;
  }

  return response.json();
}

/**
 * Parse tracking data into TrackingInfo
 */
function parseTrackData(trackData: TrackData): TrackingInfo | null {
  const trackInfo = trackData.track_info?.tracking;
  const provider = trackInfo?.providers?.[0];
  const latestStatus = trackData.track_info?.latest_status;

  if (!provider && !latestStatus) {
    return null;
  }

  const events = parseTrackingEvents(provider?.events);
  const { status, isDelivered } = calculateStatusAndDelivery(trackData, events);

  return {
    trackNumber: trackData.number,
    carrier: provider?.provider?.name || 'Unknown',
    status,
    isDelivered,
    events,
    lastUpdate: new Date(),
  };
}

/**
 * Get tracking information from 17TRACK API
 * @param carrier - Optional carrier code (2061 for Bpost, etc)
 */
export async function getTrackingInfo(
  trackNumber: string,
  apiKey: string,
  carrier?: number
): Promise<TrackingInfo | null> {
  try {
    // First, register the tracking number
    const registered = await registerTracking(trackNumber, apiKey, carrier);

    if (!registered) {
      console.error(
        `Failed to register ${trackNumber}, trying to fetch anyway...`
      );
    }

    // Wait a bit for the system to process
    await delay(REGISTRATION_DELAY_MS);

    // Get tracking info
    const data = await fetchTrackingInfo(trackNumber, apiKey);

    if (!data) return null;

    if (data.code !== 0) {
      console.error(`17TRACK API error code: ${data.code}, msg: ${data.msg}`);
      return null;
    }

    // Check for rejected tracking numbers
    if (data.data?.rejected && data.data.rejected.length > 0) {
      const rejected = data.data.rejected[0];
      console.error(
        `No tracking info for ${trackNumber}: ${rejected.error?.message || 'Unknown error'}`
      );
      return null;
    }

    // Check for accepted tracking numbers
    if (!data.data?.accepted || data.data.accepted.length === 0) {
      console.error(`No tracking data found for ${trackNumber}`);
      return null;
    }

    return parseTrackData(data.data.accepted[0]);
  } catch (error) {
    console.error(`Error fetching tracking info for ${trackNumber}:`, error);
    return null;
  }
}

/**
 * Check if cache is expired (older than 6 hours)
 */
export function isCacheExpired(lastUpdated: Date): boolean {
  const now = new Date();
  const timeDiff = now.getTime() - lastUpdated.getTime();
  return timeDiff > SIX_HOURS_MS;
}

/**
 * Fetch batch tracking info from API
 */
async function fetchBatchTrackingInfo(
  trackNumbers: string[],
  apiKey: string
): Promise<TrackingInfoResponse | null> {
  const response = await fetch(`${TRACK17_API_URL}gettrackinfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      '17token': apiKey,
    },
    body: JSON.stringify(trackNumbers.map((number) => ({ number }))),
  });

  if (!response.ok) {
    console.error(
      `17TRACK batch API error: ${response.status} ${response.statusText}`
    );
    return null;
  }

  return response.json();
}

/**
 * Process batch response and populate results map
 */
function processBatchResponse(
  data: TrackingInfoResponse,
  results: Map<string, TrackingInfo>
): void {
  if (!data.data?.accepted) return;

  for (const trackData of data.data.accepted) {
    const trackingInfo = parseTrackData(trackData);

    if (trackingInfo) {
      results.set(trackData.number, trackingInfo);
    }
  }
}

/**
 * Get multiple tracking numbers at once (batch request)
 */
export async function getBatchTrackingInfo(
  trackNumbers: string[],
  apiKey: string
): Promise<Map<string, TrackingInfo>> {
  const results = new Map<string, TrackingInfo>();

  // Register in batches
  for (let i = 0; i < trackNumbers.length; i += BATCH_SIZE) {
    const batch = trackNumbers.slice(i, i + BATCH_SIZE);
    await registerTrackingBatch(batch, apiKey);
    await delay(BATCH_DELAY_MS);
  }

  // Wait for registration to process
  await delay(POST_REGISTRATION_DELAY_MS);

  // Fetch tracking info in batches
  for (let i = 0; i < trackNumbers.length; i += BATCH_SIZE) {
    const batch = trackNumbers.slice(i, i + BATCH_SIZE);

    try {
      const data = await fetchBatchTrackingInfo(batch, apiKey);

      if (data && data.code === 0) {
        processBatchResponse(data, results);
      } else if (data) {
        console.error(
          `17TRACK batch API error code: ${data.code}, msg: ${data.msg}`
        );
      }

      await delay(BATCH_DELAY_MS);
    } catch (error) {
      console.error(`Error in batch tracking request:`, error);
    }
  }

  return results;
}
