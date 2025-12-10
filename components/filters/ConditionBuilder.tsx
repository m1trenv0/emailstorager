'use client';

import { useState } from 'react';
import { FilterCondition, ServiceField } from '@/lib/types';
import { ConditionBuilderEmptyState } from './condition-builder/ConditionBuilderEmptyState';
import { ConditionCard } from './condition-builder/ConditionCard';

interface ConditionBuilderProps {
  conditions: FilterCondition[];
  serviceFields: ServiceField[];
  onChange: (conditions: FilterCondition[]) => void;
}

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

  if (conditions.length === 0) {
    return (
      <div className="space-y-3 pt-2">
        <ConditionBuilderEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="space-y-2">
        {conditions.map((condition, index) => (
          <ConditionCard
            key={index}
            condition={condition}
            index={index}
            serviceFields={serviceFields}
            isExpanded={expandedConditions.has(index)}
            isLastCondition={index === conditions.length - 1}
            onToggle={() => toggleCondition(index)}
            onUpdate={(updates) => updateCondition(index, updates)}
            onRemove={() => removeCondition(index)}
          />
        ))}
      </div>
    </div>
  );
}
