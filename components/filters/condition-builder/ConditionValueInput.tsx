import { FilterCondition, ServiceField } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  OPERATORS_NEEDING_VALUE,
  SERVICE_REGISTRATION_FIELD,
} from '@/lib/constants/filter-operators';

interface ConditionValueInputProps {
  condition: FilterCondition;
  serviceFields: ServiceField[];
  onUpdate: (value: string | number | boolean) => void;
}

export function ConditionValueInput({
  condition,
  serviceFields,
  onUpdate,
}: ConditionValueInputProps) {
  if (condition.field === SERVICE_REGISTRATION_FIELD) {
    return null;
  }

  const needsValue = OPERATORS_NEEDING_VALUE.includes(condition.operator);
  if (!needsValue) return null;

  const field = serviceFields.find((f) => f.name === condition.field);
  const fieldType = field?.type || 'string';

  if (fieldType === 'boolean') {
    return (
      <Select
        value={
          condition.value === true
            ? 'true'
            : condition.value === false
              ? 'false'
              : 'none'
        }
        onValueChange={(value) =>
          onUpdate(value === 'none' ? '' : value === 'true')
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Select value</SelectItem>
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={fieldType === 'number' ? 'number' : 'text'}
      value={condition.value?.toString() || ''}
      onChange={(e) =>
        onUpdate(
          fieldType === 'number' ? Number(e.target.value) : e.target.value
        )
      }
      placeholder="Enter value"
    />
  );
}
