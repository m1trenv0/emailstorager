/**
 * Entity (alias/account) tracking update operations
 */

import { prisma } from '@/lib/prisma';
import { TrackingInfo } from './types';
import { ServiceStatus } from './serviceTypes';

/**
 * Build updated service status with tracking info
 */
function buildUpdatedStatus(
  currentStatus: ServiceStatus,
  trackingInfo: TrackingInfo
): ServiceStatus {
  const updatedStatus: ServiceStatus = {
    ...currentStatus,
    isDelivered: trackingInfo.isDelivered,
    trackingStatus: trackingInfo.status,
    lastTrackingUpdate: trackingInfo.lastUpdate.toISOString(),
  };

  // Clear tracking error if we now have valid data
  if (currentStatus.trackingError) {
    delete updatedStatus.trackingError;
  }

  return updatedStatus;
}

/**
 * Update alias tracking status in database
 */
export async function updateAliasTracking(
  aliasId: string,
  serviceName: string,
  trackingInfo: TrackingInfo
): Promise<boolean> {
  const alias = await prisma.alias.findUnique({
    where: { id: aliasId },
  });

  if (!alias) return false;

  const status = alias.status as Record<string, ServiceStatus>;

  if (!status[serviceName]) return false;

  status[serviceName] = buildUpdatedStatus(status[serviceName], trackingInfo);

  await prisma.alias.update({
    where: { id: aliasId },
    data: { status },
  });

  return true;
}

/**
 * Update account tracking status in database
 */
export async function updateAccountTracking(
  accountId: string,
  serviceName: string,
  trackingInfo: TrackingInfo
): Promise<boolean> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) return false;

  const status = account.status as Record<string, ServiceStatus>;

  if (!status[serviceName]) return false;

  status[serviceName] = buildUpdatedStatus(status[serviceName], trackingInfo);

  await prisma.account.update({
    where: { id: accountId },
    data: { status },
  });

  return true;
}
