import { FilterCondition, ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ConditionBuilder } from '@/components/filters/ConditionBuilder';

interface FilterConditionsSectionProps {
  conditions: FilterCondition[];
  serviceFields: ServiceField[];
  onConditionsChange: (conditions: FilterCondition[]) => void;
}

export function FilterConditionsSection({
  conditions,
  serviceFields,
  onConditionsChange,
}: FilterConditionsSectionProps) {
  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      field: serviceFields[0]?.name || '',
      operator: 'equals',
      value: '',
    };
    onConditionsChange([...conditions, newCondition]);
  };

  if (serviceFields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-foreground">
          Filter Conditions
        </h3>
        <Button
          onClick={handleAddCondition}
          size="sm"
          type="button"
          variant="outline"
          className="flex-shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Condition
        </Button>
      </div>

      <ConditionBuilder
        conditions={conditions}
        serviceFields={serviceFields}
        onChange={onConditionsChange}
      />

      {conditions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          All conditions must be met (AND logic) for the filter to match.
        </p>
      )}
    </div>
  );
}
