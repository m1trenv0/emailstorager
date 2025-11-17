import { FilterOperator } from '@/lib/types';

export const SERVICE_REGISTRATION_FIELD = '__service_registered__';

export const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater Than or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less Than or Equal' },
  { value: 'exists', label: 'Exists' },
  { value: 'not_exists', label: 'Not Exists' },
];

export const OPERATORS_NEEDING_VALUE: FilterOperator[] = [
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'gt',
  'gte',
  'lt',
  'lte',
];

export function getAvailableOperators(fieldName: string): typeof OPERATORS {
  if (fieldName === SERVICE_REGISTRATION_FIELD) {
    return OPERATORS.filter(
      (op) => op.value === 'exists' || op.value === 'not_exists'
    );
  }
  return OPERATORS;
}
