'use client';

import { useState } from 'react';
import { ServiceField } from '@/lib/types';
import { useFieldDragDrop } from '@/lib/hooks/useFieldDragDrop';
import { FieldBuilderEmptyState } from './field-builder/FieldBuilderEmptyState';
import { FieldCard } from './field-builder/FieldCard';

interface FieldBuilderProps {
  fields: ServiceField[];
  onChange: (fields: ServiceField[]) => void;
}

export function FieldBuilder({ fields, onChange }: FieldBuilderProps) {
  const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set());
  const { draggedIndex, handleDragStart, handleDragOver, handleDragEnd } =
    useFieldDragDrop(fields, onChange);

  const updateField = (index: number, updates: Partial<ServiceField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onChange(newFields);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
    const newExpanded = new Set(expandedFields);
    newExpanded.delete(index);
    setExpandedFields(newExpanded);
  };

  const toggleField = (index: number) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFields(newExpanded);
  };

  const fieldNames = fields.map((f) => f.name).filter((n) => n);

  if (fields.length === 0) {
    return (
      <div className="space-y-3 pt-2">
        <FieldBuilderEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="space-y-2">
        {fields.map((field, index) => (
          <FieldCard
            key={index}
            field={field}
            index={index}
            fieldNames={fieldNames}
            isExpanded={expandedFields.has(index)}
            isDragging={draggedIndex === index}
            onToggle={() => toggleField(index)}
            onUpdate={(updates) => updateField(index, updates)}
            onRemove={() => removeField(index)}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
