/**
 * Status calculation utilities for tracking
 */

import { TrackingEvent, TrackData, TrackingProvider } from './types';

const DELIVERED_KEYWORDS = [
  'delivered',
  'successful delivery',
  'final delivery',
  'has been delivered',
];

const FALSE_POSITIVE_KEYWORDS = [
  'undelivered',
  'out for delivery',
  'failure',
  'return',
  'attempt',
];

/**
 * Check if events contain delivery confirmation
 */
function checkEventsForDelivery(events: TrackingEvent[]): boolean {
  return events.some((event) => {
    const statusLower = event.status.toLowerCase();
    const descriptionLower = event.description.toLowerCase();

    // Avoid false positives
    const hasFalsePositive = FALSE_POSITIVE_KEYWORDS.some(
      (keyword) =>
        statusLower.includes(keyword) || descriptionLower.includes(keyword)
    );

    if (hasFalsePositive) return false;

    return DELIVERED_KEYWORDS.some(
      (keyword) =>
        statusLower.includes(keyword) || descriptionLower.includes(keyword)
    );
  });
}

/**
 * Determine if package is delivered based on tracking data
 */
function calculateIsDelivered(
  latestStatus: string | undefined,
  provider: TrackingProvider | undefined,
  events: TrackingEvent[]
): boolean {
  // Check summary status first (most reliable if available)
  if (latestStatus === 'Delivered') {
    return true;
  }

  // Check latest event stage
  const latestStage = provider?.latest_event?.stage?.toLowerCase();
  if (latestStage === 'delivered') {
    return true;
  }

  // Check all events
  return checkEventsForDelivery(events);
}

/**
 * Determine status text from tracking data
 */
function calculateStatusText(
  latestStatus: string | undefined,
  provider: TrackingProvider | undefined,
  events: TrackingEvent[],
  isDelivered: boolean
): string {
  // Prefer detailed description from latest event
  if (events.length > 0) {
    return events[0].description;
  }

  if (provider?.latest_event?.description) {
    return provider.latest_event.description;
  }

  if (latestStatus && latestStatus !== 'NotFound') {
    return latestStatus;
  }

  if (provider?.latest_event?.stage) {
    return provider.latest_event.stage;
  }

  if (latestStatus === 'NotFound') {
    return 'Not Found';
  }

  // Fallback for when we have Delivered status but description is unknown
  if (isDelivered) {
    return 'Delivered';
  }

  return 'unknown';
}

interface StatusResult {
  status: string;
  isDelivered: boolean;
}

/**
 * Calculate status and delivery state from tracking data
 */
export function calculateStatusAndDelivery(
  trackData: TrackData,
  events: TrackingEvent[]
): StatusResult {
  const latestStatus = trackData.track_info?.latest_status?.status;
  const provider = trackData.track_info?.tracking?.providers?.[0];

  const isDelivered = calculateIsDelivered(latestStatus, provider, events);
  const status = calculateStatusText(
    latestStatus,
    provider,
    events,
    isDelivered
  );

  return { status, isDelivered };
}
