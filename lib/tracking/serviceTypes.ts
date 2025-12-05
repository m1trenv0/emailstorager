/**
 * Types for tracking service database operations
 */

import { ServiceFieldValue } from '@/lib/types';

/**
 * Service status structure in alias/account
 */
export interface ServiceStatus {
  TrackNumber?: string;
  isDelivered?: boolean;
  trackingStatus?: string;
  lastTrackingUpdate?: string;
  trackingError?: string;
  [key: string]: ServiceFieldValue | undefined;
}

/**
 * Alias status structure
 */
export interface AliasStatusRecord {
  [serviceName: string]: ServiceStatus;
}

/**
 * Track number entry for batch updates
 */
export interface TrackNumberEntry {
  id: string;
  type: 'alias' | 'account';
  trackNumber: string;
}

/**
 * Result of batch tracking update
 */
export interface TrackingUpdateResult {
  updated: number;
  failed: number;
}
