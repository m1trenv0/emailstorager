/**
 * Service utilities for flexible service status management
 */

import { AliasStatus, ServiceFieldValue, ServiceField } from './types';

/**
 * Helper to safely get a service status field value
 */
export function getServiceField(
  status: AliasStatus,
  serviceName: string,
  fieldName: string
): ServiceFieldValue | undefined {
  const serviceStatus = status[serviceName];
  if (!serviceStatus) return undefined;
  return serviceStatus[fieldName];
}

/**
 * Helper to set a service status field value
 */
export function setServiceField(
  status: AliasStatus,
  serviceName: string,
  fieldName: string,
  value: ServiceFieldValue
): AliasStatus {
  console.log(
    `[setServiceField] Setting field ${serviceName}.${fieldName} to value:`,
    {
      value: JSON.stringify(value),
      valueType: typeof value,
      serviceName,
      fieldName,
      currentServiceStatus: JSON.stringify(status[serviceName] || {}),
      fullStatusBefore: JSON.stringify(status),
    }
  );

  const newStatus = {
    ...status,
    [serviceName]: {
      ...(status[serviceName] || {}),
      [fieldName]: value,
    },
  };

  console.log(
    `[setServiceField] New status after setting ${serviceName}.${fieldName}:`,
    JSON.stringify(newStatus)
  );

  return newStatus;
}

/**
 * Helper to check if a service exists in the status
 */
export function hasService(status: AliasStatus, serviceName: string): boolean {
  return !!status[serviceName];
}

/**
 * Helper to get all services in the status
 */
export function getServices(status: AliasStatus): string[] {
  return Object.keys(status);
}

/**
 * Validate field value against field definition
 */
export function validateFieldValue(
  field: ServiceField,
  value: ServiceFieldValue
): { valid: boolean; error?: string } {
  if (field.required && (value === null || value === undefined)) {
    return { valid: false, error: `${field.name} is required` };
  }

  if (value === null || value === undefined) {
    return { valid: true };
  }

  // Type validation
  switch (field.type) {
    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, error: `${field.name} must be a string` };
      }
      break;
    case 'number':
      if (typeof value !== 'number') {
        return { valid: false, error: `${field.name} must be a number` };
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        return { valid: false, error: `${field.name} must be a boolean` };
      }
      break;
    case 'date':
      if (!(value instanceof Date) && typeof value !== 'string') {
        return { valid: false, error: `${field.name} must be a date` };
      }
      break;
  }

  return { valid: true };
}

/**
 * Validate service status against service field definitions
 */
export function validateServiceStatus(
  status: Record<string, ServiceFieldValue>,
  fields: ServiceField[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of fields) {
    const value = status[field.name];
    const validation = validateFieldValue(field, value);

    if (!validation.valid && validation.error) {
      errors.push(validation.error);
    }

    // Check dependencies
    if (field.dependsOn && value !== null && value !== undefined) {
      for (const dep of field.dependsOn) {
        const depValue = status[dep];
        if (depValue === null || depValue === undefined) {
          errors.push(`${field.name} requires ${dep} to be set`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default service configuration for built-in services
 */
export function getDefaultServiceConfig(serviceName: string): ServiceField[] {
  switch (serviceName.toLowerCase()) {
    case 'aliexpress':
      return [
        {
          name: 'registerDate',
          type: 'date',
          required: false,
          description: 'Registration date (indicates isRegistered)',
        },
        {
          name: 'trackNumber',
          type: 'string',
          required: false,
          description: 'Tracking number for orders',
        },
        {
          name: 'OrderDescription',
          type: 'string',
          required: false,
          description: 'Order description',
        },
        {
          name: 'isDelivered',
          type: 'boolean',
          required: false,
          dependsOn: ['trackNumber'],
          description: 'Delivery status (requires track number)',
        },
        {
          name: 'isBanned',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Account ban status',
        },
      ];
    case 'augment':
      return [
        {
          name: 'register',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Registration status',
        },
        {
          name: 'isBanned',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Account ban status',
        },
      ];
    default:
      return [];
  }
}
