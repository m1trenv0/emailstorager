import { FilterCondition, AliasWithStatus } from './types';

// Special pseudo-field for service registration status
const SERVICE_REGISTRATION_FIELD = '__service_registered__';

/**
 * Evaluates a single filter condition against an alias
 */
export function evaluateCondition(
  alias: AliasWithStatus,
  condition: FilterCondition,
  serviceName: string
): boolean {
  const serviceStatus = alias.status[serviceName];

  // Handle special service registration field
  if (condition.field === SERVICE_REGISTRATION_FIELD) {
    const isRegistered = !!(
      serviceStatus &&
      typeof serviceStatus === 'object' &&
      Object.keys(serviceStatus).length > 0
    );
    console.log(
      `[evaluateCondition] ${alias.email} - Service: ${serviceName}, isRegistered: ${isRegistered}, operator: ${condition.operator}, result: ${condition.operator === 'exists' ? isRegistered : !isRegistered}`
    );
    if (condition.operator === 'exists') {
      return isRegistered;
    }
    if (condition.operator === 'not_exists') {
      return !isRegistered;
    }
    return false;
  }

  // If service doesn't exist on alias, handle exists/not_exists operators
  if (!serviceStatus || typeof serviceStatus !== 'object') {
    return condition.operator === 'not_exists';
  }

  const fieldValue = serviceStatus[condition.field];

  switch (condition.operator) {
    case 'exists':
      return (
        fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
      );

    case 'not_exists':
      return (
        fieldValue === undefined || fieldValue === null || fieldValue === ''
      );

    case 'equals':
      return fieldValue === condition.value;

    case 'not_equals':
      return fieldValue !== condition.value;

    case 'contains':
      if (
        typeof fieldValue === 'string' &&
        typeof condition.value === 'string'
      ) {
        return fieldValue.toLowerCase().includes(condition.value.toLowerCase());
      }
      return false;

    case 'not_contains':
      if (
        typeof fieldValue === 'string' &&
        typeof condition.value === 'string'
      ) {
        return !fieldValue
          .toLowerCase()
          .includes(condition.value.toLowerCase());
      }
      return true;

    case 'gt':
      if (
        typeof fieldValue === 'number' &&
        typeof condition.value === 'number'
      ) {
        return fieldValue > condition.value;
      }
      if (fieldValue instanceof Date && condition.value instanceof Date) {
        return fieldValue > condition.value;
      }
      return false;

    case 'gte':
      if (
        typeof fieldValue === 'number' &&
        typeof condition.value === 'number'
      ) {
        return fieldValue >= condition.value;
      }
      if (fieldValue instanceof Date && condition.value instanceof Date) {
        return fieldValue >= condition.value;
      }
      return false;

    case 'lt':
      if (
        typeof fieldValue === 'number' &&
        typeof condition.value === 'number'
      ) {
        return fieldValue < condition.value;
      }
      if (fieldValue instanceof Date && condition.value instanceof Date) {
        return fieldValue < condition.value;
      }
      return false;

    case 'lte':
      if (
        typeof fieldValue === 'number' &&
        typeof condition.value === 'number'
      ) {
        return fieldValue <= condition.value;
      }
      if (fieldValue instanceof Date && condition.value instanceof Date) {
        return fieldValue <= condition.value;
      }
      return false;

    default:
      return false;
  }
}

/**
 * Evaluates all conditions in a filter (AND logic)
 */
export function evaluateFilter(
  alias: AliasWithStatus,
  conditions: FilterCondition[],
  serviceName: string
): boolean {
  if (conditions.length === 0) return true;

  return conditions.every((condition) =>
    evaluateCondition(alias, condition, serviceName)
  );
}

/**
 * Filters aliases based on filter conditions
 */
export function filterAliases(
  aliases: AliasWithStatus[],
  conditions: FilterCondition[],
  serviceName: string
): AliasWithStatus[] {
  console.log('[filterAliases] Starting filter:', {
    totalAliases: aliases.length,
    serviceName,
    conditions: JSON.stringify(conditions, null, 2),
  });

  const results = aliases.filter((alias) => {
    const result = evaluateFilter(alias, conditions, serviceName);
    console.log(`[filterAliases] Alias ${alias.email}:`, {
      hasService: !!alias.status[serviceName],
      result,
    });
    return result;
  });

  console.log('[filterAliases] Filtered results:', {
    totalMatches: results.length,
    emails: results.map((a) => a.email),
  });

  return results;
}
