import { FilterCondition } from '@/lib/types';

const SERVICE_REGISTRATION_FIELD = '__service_registered__';

const OPERATORS_NEEDING_VALUE = [
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'gt',
  'gte',
  'lt',
  'lte',
];

export function validateFilterConditions(
  conditions: FilterCondition[],
  serviceFieldNames: string[]
): string | null {
  for (const condition of conditions) {
    // Allow the special service registration field
    if (condition.field === SERVICE_REGISTRATION_FIELD) {
      if (
        condition.operator !== 'exists' &&
        condition.operator !== 'not_exists'
      ) {
        return `Service Registration Status field only supports "exists" or "not_exists" operators`;
      }
      continue;
    }

    if (!serviceFieldNames.includes(condition.field)) {
      return `Field "${condition.field}" does not exist in service`;
    }

    if (
      OPERATORS_NEEDING_VALUE.includes(condition.operator) &&
      condition.value === undefined
    ) {
      return `Operator "${condition.operator}" requires a value`;
    }
  }

  return null;
}
