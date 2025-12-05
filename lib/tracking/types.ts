/**
 * Types for 17TRACK API integration
 */

/**
 * Single tracking event from carrier
 */
export interface TrackingEvent {
  time: string;
  status: string;
  description: string;
  location?: string;
}

/**
 * Complete tracking information for a package
 */
export interface TrackingInfo {
  trackNumber: string;
  carrier: string;
  status: string;
  isDelivered: boolean;
  events: TrackingEvent[];
  lastUpdate: Date;
}

/**
 * Request body for tracking registration
 */
export interface TrackingRegisterRequest {
  number: string;
  carrier?: number;
}

/**
 * 17TRACK API response for registration
 */
export interface TrackingRegisterResponse {
  code: number;
  data?: {
    accepted?: Array<{ number: string }>;
    rejected?: Array<{
      number: string;
      error?: { code: number; message: string };
    }>;
  };
}

/**
 * 17TRACK API raw event data
 */
export interface RawTrackingEvent {
  time_iso?: string;
  time_utc?: string;
  stage?: string;
  description: string;
  location?: string;
}

/**
 * 17TRACK API provider data
 */
export interface TrackingProvider {
  provider?: { name: string };
  latest_event?: {
    stage?: string;
    description?: string;
  };
  events?: RawTrackingEvent[];
}

/**
 * 17TRACK API track data structure
 */
export interface TrackData {
  number: string;
  track_info?: {
    latest_status?: {
      status: string;
    };
    tracking?: {
      providers?: TrackingProvider[];
    };
  };
}

/**
 * 17TRACK API response for gettrackinfo
 */
export interface TrackingInfoResponse {
  code: number;
  msg?: string;
  data?: {
    accepted?: TrackData[];
    rejected?: Array<{
      number: string;
      error?: { message: string };
    }>;
  };
}

/**
 * Constants for tracking
 */
export const TRACK17_API_URL = 'https://api.17track.net/track/v2.2/';
export const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
export const BATCH_SIZE = 40;
export const REGISTRATION_DELAY_MS = 1000;
export const BATCH_DELAY_MS = 1000;
export const POST_REGISTRATION_DELAY_MS = 2000;
