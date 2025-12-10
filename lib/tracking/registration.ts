/**
 * 17TRACK Registration API
 */

import {
  TRACK17_API_URL,
  TrackingRegisterRequest,
  TrackingRegisterResponse,
} from './types';

const ALREADY_REGISTERED_ERROR_CODE = -18019901;

/**
 * Register tracking number with 17TRACK
 * @param trackNumber - The tracking number to register
 * @param apiKey - 17TRACK API key
 * @param carrier - Optional carrier code (e.g., 2061 for Bpost)
 * @returns true if registered successfully or already registered
 */
export async function registerTracking(
  trackNumber: string,
  apiKey: string,
  carrier?: number
): Promise<boolean> {
  try {
    const body: TrackingRegisterRequest = { number: trackNumber };

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

    const data: TrackingRegisterResponse = await response.json();

    if (data.code !== 0) {
      console.error(`17TRACK register error code: ${data.code}`);
      return false;
    }

    // Check if accepted
    if (data.data?.accepted && data.data.accepted.length > 0) {
      return true;
    }

    // Check if rejected - already registered is a success
    if (data.data?.rejected && data.data.rejected.length > 0) {
      const error = data.data.rejected[0]?.error;

      if (error?.code === ALREADY_REGISTERED_ERROR_CODE) {
        return true;
      }

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
 * Register multiple tracking numbers in batch
 */
export async function registerTrackingBatch(
  trackNumbers: string[],
  apiKey: string
): Promise<void> {
  try {
    await fetch(`${TRACK17_API_URL}register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': apiKey,
      },
      body: JSON.stringify(trackNumbers.map((number) => ({ number }))),
    });
  } catch (error) {
    console.error(`Error registering batch:`, error);
  }
}
