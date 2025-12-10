import { FilterCondition } from '@/lib/types';
import { OPERATORS_NEEDING_VALUE } from '@/lib/constants/filter-operators';

export function validateFilterForm(
  name: string,
  categoryId: string,
  conditions: FilterCondition[]
): string | null {
  if (!name.trim()) {
    return 'Filter name is required';
  }

  if (!categoryId) {
    return 'Category is required';
  }

  if (conditions.length === 0) {
    return 'At least one condition is required';
  }

  for (const condition of conditions) {
    if (!condition.field) {
      return 'All conditions must have a field selected';
    }

    const needsValue = OPERATORS_NEEDING_VALUE.includes(condition.operator);

    if (
      needsValue &&
      (condition.value === undefined || condition.value === '')
    ) {
      return `Condition "${condition.field}" with operator "${condition.operator}" requires a value`;
    }
  }

  return null;
}
