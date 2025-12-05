/**
 * Event parsing utilities for tracking
 */

import { TrackingEvent, RawTrackingEvent } from './types';

/**
 * Parse raw API event into TrackingEvent
 */
export function parseTrackingEvent(event: RawTrackingEvent): TrackingEvent {
  return {
    time: event.time_iso || event.time_utc || '',
    status: event.stage || 'unknown',
    description: event.description,
    location: event.location,
  };
}

/**
 * Parse array of raw events into TrackingEvents
 */
export function parseTrackingEvents(
  events: RawTrackingEvent[] | undefined
): TrackingEvent[] {
  if (!events) return [];
  return events.map(parseTrackingEvent);
}
