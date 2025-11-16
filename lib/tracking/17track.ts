/**
 * 17TRACK API Integration
 * Documentation: https://api.17track.net/en/doc
 *
 * Workflow:
 * 1. Register tracking number (if not already registered)
 * 2. Get tracking info
 */

export interface TrackingEvent {
  time: string;
  status: string;
  description: string;
  location?: string;
}

export interface TrackingInfo {
  trackNumber: string;
  carrier: string;
  status: string;
  isDelivered: boolean;
  events: TrackingEvent[];
  lastUpdate: Date;
}

const TRACK17_API_URL = 'https://api.17track.net/track/v2.2/';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * Register tracking number with 17TRACK
 * @param carrier - Optional carrier code (e.g., 2061 for Bpost). If not provided, auto-detect.
 */
async function registerTracking(
  trackNumber: string,
  apiKey: string,
  carrier?: number
): Promise<boolean> {
  try {
    const body: any = {
      number: trackNumber,
    };

    // Add carrier if specified
    if (carrier) {
      body.carrier = carrier;
    }

    const response = await fetch(`${TRACK17_API_URL}register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': apiKey,
      },
      body: JSON.stringify([body]),
    });

    if (!response.ok) {
      console.error(`17TRACK register error: ${response.status}`);
      return false;
    }

    const data = await response.json();

    if (data.code !== 0) {
      console.error(`17TRACK register error code: ${data.code}`);
      return false;
    }

    // Check if accepted
    if (data.data?.accepted && data.data.accepted.length > 0) {
      return true;
    }

    // Check if rejected
    if (data.data?.rejected && data.data.rejected.length > 0) {
      console.error('Track number rejected:', data.data.rejected[0]);
      return false;
    }

    return false;
  } catch (error) {
    console.error(`Error registering tracking number:`, error);
    return false;
  }
}

/**
 * Get tracking information from 17TRACK API
 * @param carrier - Optional carrier code (2061 for Bpost, etc). Helps with detection.
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
      console.log(`Failed to register ${trackNumber}, trying to fetch anyway...`);
    }

    // Wait a bit for the system to process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get tracking info
    const response = await fetch(`${TRACK17_API_URL}gettrackinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': apiKey,
      },
      body: JSON.stringify([
        {
          number: trackNumber,
        },
      ]),
    });

    if (!response.ok) {
      console.error(
        `17TRACK API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    if (data.code !== 0) {
      console.error(`17TRACK API error code: ${data.code}, msg: ${data.msg}`);
      return null;
    }

    // Check for rejected tracking numbers
    if (data.data?.rejected && data.data.rejected.length > 0) {
      const rejected = data.data.rejected[0];
      console.log(
        `No tracking info for ${trackNumber}: ${rejected.error?.message || 'Unknown error'}`
      );
      return null;
    }

    // Check for accepted tracking numbers
    if (!data.data?.accepted || data.data.accepted.length === 0) {
      console.log(`No tracking data found for ${trackNumber}`);
      return null;
    }

    const trackData = data.data.accepted[0];
    const trackInfo = trackData.track_info?.tracking;
    const provider = trackInfo?.providers?.[0];

    if (!provider) {
      console.log(`No provider info for ${trackNumber}`);
      return null;
    }

    // Parse events
    const events: TrackingEvent[] = (provider.events || []).map((event: any) => ({
      time: event.time_iso || event.time_utc,
      status: event.stage || 'unknown',
      description: event.description,
      location: event.location,
    }));

    // Determine if delivered based on stage
    const latestStage = provider.latest_event?.stage?.toLowerCase() || '';
    const isDelivered =
      latestStage === 'delivered' ||
      latestStage === 'delivery' ||
      events.some((e) => e.status.toLowerCase().includes('delivered'));

    // Use the latest event description as status for more detail
    let status = events.length > 0 ? events[0].description : (provider.latest_event?.description || provider.latest_event?.stage || 'unknown');
    if (status === 'unknown' && events.length > 0 && !isDelivered) {
      status = 'In transit';
    }

    return {
      trackNumber,
      carrier: provider.provider.name,
      status,
      isDelivered,
      events,
      lastUpdate: new Date(),
    };
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
 * Get multiple tracking numbers at once (batch request)
 */
export async function getBatchTrackingInfo(
  trackNumbers: string[],
  apiKey: string
): Promise<Map<string, TrackingInfo>> {
  const results = new Map<string, TrackingInfo>();

  // Register all tracking numbers first (batch)
  const batchSize = 40;

  // Register in batches
  for (let i = 0; i < trackNumbers.length; i += batchSize) {
    const batch = trackNumbers.slice(i, i + batchSize);

    try {
      await fetch(`${TRACK17_API_URL}register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          '17token': apiKey,
        },
        body: JSON.stringify(
          batch.map((number) => ({
            number,
          }))
        ),
      });

      // Wait between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error registering batch:`, error);
    }
  }

  // Wait for registration to process
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Fetch tracking info in batches
  for (let i = 0; i < trackNumbers.length; i += batchSize) {
    const batch = trackNumbers.slice(i, i + batchSize);

    try {
      const response = await fetch(`${TRACK17_API_URL}gettrackinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          '17token': apiKey,
        },
        body: JSON.stringify(
          batch.map((number) => ({
            number,
          }))
        ),
      });

      if (!response.ok) {
        console.error(
          `17TRACK batch API error: ${response.status} ${response.statusText}`
        );
        continue;
      }

      const data = await response.json();

      if (data.code !== 0) {
        console.error(
          `17TRACK batch API error code: ${data.code}, msg: ${data.msg}`
        );
        continue;
      }

      // Process each accepted tracking number
      if (data.data?.accepted) {
        for (const trackData of data.data.accepted) {
          const trackInfo = trackData.track_info?.tracking;
          const provider = trackInfo?.providers?.[0];

          if (!provider) continue;

          const events: TrackingEvent[] = (provider.events || []).map(
            (event: any) => ({
              time: event.time_iso || event.time_utc,
              status: event.stage || 'unknown',
              description: event.description,
              location: event.location,
            })
          );

          const latestStage = provider.latest_event?.stage?.toLowerCase() || '';
          const isDelivered =
            latestStage === 'delivered' ||
            latestStage === 'delivery' ||
            events.some((e) => e.status.toLowerCase().includes('delivered'));

          // Use the latest event description as status for more detail
          let status = events.length > 0 ? events[0].description : (provider.latest_event?.description || provider.latest_event?.stage || 'unknown');
          if (status === 'unknown' && events.length > 0 && !isDelivered) {
            status = 'In transit';
          }

          results.set(trackData.number, {
            trackNumber: trackData.number,
            carrier: provider.provider.name,
            status,
            isDelivered,
            events,
            lastUpdate: new Date(),
          });
        }
      }

      // Wait between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error in batch tracking request:`, error);
    }
  }

  return results;
}
