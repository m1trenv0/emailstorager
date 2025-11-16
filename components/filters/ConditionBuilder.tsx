'use client';

import { useState } from 'react';
import { FilterCondition, FilterOperator, ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, GripVertical, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ConditionBuilderProps {
  conditions: FilterCondition[];
  serviceFields: ServiceField[];
  onChange: (conditions: FilterCondition[]) => void;
}

// Special pseudo-field for service registration status
const SERVICE_REGISTRATION_FIELD = '__service_registered__';

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
  const [expandedConditions, setExpandedConditions] = useState<Set<number>>(
    new Set()
  );

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
    const newExpanded = new Set(expandedConditions);
    newExpanded.delete(index);
    setExpandedConditions(newExpanded);
  };

  const toggleCondition = (index: number) => {
    const newExpanded = new Set(expandedConditions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedConditions(newExpanded);
  };

  const getFieldType = (fieldName: string): string => {
    if (fieldName === SERVICE_REGISTRATION_FIELD) {
      return 'boolean';
    }
    const field = serviceFields.find((f) => f.name === fieldName);
    return field?.type || 'string';
  };

  const isServiceRegistrationField = (fieldName: string): boolean => {
    return fieldName === SERVICE_REGISTRATION_FIELD;
  };

  const getAvailableOperators = (fieldName: string): typeof OPERATORS => {
    // For service registration field, only show exists/not_exists operators
    if (isServiceRegistrationField(fieldName)) {
      return OPERATORS.filter(
        (op) => op.value === 'exists' || op.value === 'not_exists'
      );
    }
    return OPERATORS;
  };

  const renderValueInput = (condition: FilterCondition, index: number) => {
    // Service registration field doesn't need value input
    if (isServiceRegistrationField(condition.field)) {
      return null;
    }

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
    <div className="space-y-3 pt-2">
      {conditions.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No conditions added yet</p>
            <p className="text-sm text-muted-foreground">
              Click &quot;Add Condition&quot; to create your first filter rule
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <Collapsible
              key={index}
              open={expandedConditions.has(index)}
              onOpenChange={() => toggleCondition(index)}
            >
              <div
                className={`border rounded-lg bg-card transition-all ${
                  expandedConditions.has(index) ? 'shadow-sm' : ''
                }`}
              >
                {/* Compact Header */}
                <div className="flex items-center gap-2 p-3">
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left hover:text-foreground transition-colors">
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedConditions.has(index)
                          ? 'rotate-0'
                          : '-rotate-90'
                      }`}
                    />
                    <span className="font-mono font-medium text-sm">
                      {condition.field || (
                        <span className="text-muted-foreground italic">
                          No field
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted border ml-1">
                      {condition.operator}
                    </span>
                    {condition.value !== undefined &&
                      condition.value !== '' && (
                        <span className="text-xs text-foreground px-2 py-0.5 rounded bg-accent border ml-1 font-mono">
                          = {String(condition.value)}
                        </span>
                      )}
                  </CollapsibleTrigger>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCondition(index)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Remove condition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expandable Content */}
                <CollapsibleContent>
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
                          onValueChange={(value) =>
                            updateCondition(index, { field: value })
                          }
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
                            updateCondition(index, {
                              operator: value as FilterOperator,
                            })
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
                        {renderValueInput(condition, index)}
                      </div>
                    </div>

                    {index < conditions.length - 1 && (
                      <div className="text-center text-sm font-semibold text-muted-foreground pt-3">
                        AND
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
