'use client';

import { FilterCondition, FilterOperator, ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

interface ConditionBuilderProps {
  conditions: FilterCondition[];
  serviceFields: ServiceField[];
  onChange: (conditions: FilterCondition[]) => void;
}

const OPERATORS: { value: FilterOperator; label: string }[] = [
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

export function ConditionBuilder({
  conditions,
  serviceFields,
  onChange,
}: ConditionBuilderProps) {
  const addCondition = () => {
    const newCondition: FilterCondition = {
      field: serviceFields[0]?.name || '',
      operator: 'equals',
      value: '',
    };
    onChange([...conditions, newCondition]);
  };

  const updateCondition = (
    index: number,
    updates: Partial<FilterCondition>
  ) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    onChange(newConditions);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const getFieldType = (fieldName: string): string => {
    const field = serviceFields.find((f) => f.name === fieldName);
    return field?.type || 'string';
  };

  const renderValueInput = (condition: FilterCondition, index: number) => {
    const needsValue = OPERATORS_NEEDING_VALUE.includes(condition.operator);
    if (!needsValue) return null;

    const fieldType = getFieldType(condition.field);

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
            updateCondition(index, {
              value: value === 'none' ? '' : value === 'true',
            })
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
          updateCondition(index, {
            value:
              fieldType === 'number' ? Number(e.target.value) : e.target.value,
          })
        }
        placeholder="Enter value"
      />
    );
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filter Conditions</h3>
        <Button onClick={addCondition} size="sm" type="button">
          <Plus className="mr-2 h-4 w-4" />
          Add Condition
        </Button>
      </header>

      {conditions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No conditions added yet. Click "Add Condition" to create your first
            filter rule.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Condition {index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`condition-field-${index}`}>
                      Field <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={condition.field}
                      onValueChange={(value) =>
                        updateCondition(index, { field: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceFields.map((field) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.name} ({field.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`condition-operator-${index}`}>
                      Operator <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) =>
                        updateCondition(index, {
                          operator: value as FilterOperator,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select operator..." />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`condition-value-${index}`}>Value</Label>
                    {renderValueInput(condition, index)}
                  </div>
                </div>

                {index < conditions.length - 1 && (
                  <div className="text-center text-sm font-semibold text-muted-foreground">
                    AND
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {conditions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          All conditions must be met (AND logic) for the filter to match.
        </p>
      )}
    </section>
  );
}
