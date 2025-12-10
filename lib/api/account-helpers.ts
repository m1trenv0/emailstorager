import { setServiceField } from '@/lib/service-utils';
import { ServiceFieldValue } from '@/lib/types';

interface ServiceUpdate {
  serviceName: string;
  fieldName: string;
  value: ServiceFieldValue;
}

interface AccountUpdateData {
  primaryEmail?: string;
  recoveryEmail?: string;
  recoveryPassword?: string;
  serviceName?: string;
  fieldName?: string;
  value?: ServiceFieldValue;
  serviceUpdates?: ServiceUpdate[];
}

export function buildAccountUpdateData(
  validatedData: AccountUpdateData,
  existingStatus: unknown
): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};

  // Handle batch service field updates
  if (validatedData.serviceUpdates?.length) {
    let currentStatus = getStatusObject(existingStatus);

    for (const update of validatedData.serviceUpdates) {
      currentStatus = setServiceField(
        currentStatus,
        update.serviceName,
        update.fieldName,
        update.value ?? null
      );
    }

    updateData.status = currentStatus;
  }
  // Handle single service field update
  else if (validatedData.serviceName && validatedData.fieldName !== undefined) {
    const currentStatus = getStatusObject(existingStatus);
    updateData.status = setServiceField(
      currentStatus,
      validatedData.serviceName,
      validatedData.fieldName,
      validatedData.value ?? null
    );
  }

  // Handle other account field updates
  if (validatedData.primaryEmail) {
    updateData.primaryEmail = validatedData.primaryEmail;
  }
  if (validatedData.recoveryEmail) {
    updateData.recoveryEmail = validatedData.recoveryEmail;
  }
  if (validatedData.recoveryPassword) {
    updateData.recoveryPassword = validatedData.recoveryPassword;
  }

  return updateData;
}

function getStatusObject(
  status: unknown
): Record<string, Record<string, ServiceFieldValue>> {
  return typeof status === 'object' && status !== null
    ? (status as Record<string, Record<string, ServiceFieldValue>>)
    : {};
}
