import { FilterCondition, FilterOperator, ServiceField } from '@/lib/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConditionValueInput } from './ConditionValueInput';
import {
  getAvailableOperators,
  SERVICE_REGISTRATION_FIELD,
} from '@/lib/constants/filter-operators';

interface ConditionFormProps {
  condition: FilterCondition;
  index: number;
  serviceFields: ServiceField[];
  isLastCondition: boolean;
  onUpdate: (updates: Partial<FilterCondition>) => void;
}

export function ConditionForm({
  condition,
  index,
  serviceFields,
  isLastCondition,
  onUpdate,
}: ConditionFormProps) {
  return (
    <div className="px-3 pb-3 pt-1 space-y-4 border-t">
      <div className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label
            htmlFor={`condition-field-${index}`}
            className="text-xs font-medium"
          >
            Field <span className="text-red-500">*</span>
          </Label>
          <Select
            value={condition.field}
            onValueChange={(value) => onUpdate({ field: value })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select field..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                key={SERVICE_REGISTRATION_FIELD}
                value={SERVICE_REGISTRATION_FIELD}
              >
                <span className="font-semibold">
                  Service Registration Status
                </span>
              </SelectItem>
              {serviceFields.map((field) => (
                <SelectItem key={field.name} value={field.name}>
                  {field.name} ({field.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`condition-operator-${index}`}
            className="text-xs font-medium"
          >
            Operator <span className="text-red-500">*</span>
          </Label>
          <Select
            value={condition.operator}
            onValueChange={(value) =>
              onUpdate({ operator: value as FilterOperator })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select operator..." />
            </SelectTrigger>
            <SelectContent>
              {getAvailableOperators(condition.field).map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`condition-value-${index}`}
            className="text-xs font-medium"
          >
            Value
          </Label>
          <ConditionValueInput
            condition={condition}
            serviceFields={serviceFields}
            onUpdate={(value) => onUpdate({ value })}
          />
        </div>
      </div>

      {!isLastCondition && (
        <div className="text-center text-sm font-semibold text-muted-foreground pt-3">
          AND
        </div>
      )}
    </div>
  );
}
