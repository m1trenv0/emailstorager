'use client';

import { useState } from 'react';
import { ServiceField, ServiceFieldType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface FieldBuilderProps {
  fields: ServiceField[];
  onChange: (fields: ServiceField[]) => void;
}

const fieldTypeIcons: Record<ServiceFieldType, string> = {
  string: '📝',
  number: '🔢',
  boolean: '✓/✗',
  date: '📅',
};

export function FieldBuilder({ fields, onChange }: FieldBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set());

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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);
    onChange(newFields);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const fieldNames = fields.map((f) => f.name).filter((n) => n);

  return (
    <div className="space-y-3 pt-2">
      {fields.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No fields added yet</p>
            <p className="text-sm text-muted-foreground">
              Click &quot;Add Field&quot; to create custom fields for this
              service
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <Collapsible
              key={index}
              open={expandedFields.has(index)}
              onOpenChange={() => toggleField(index)}
            >
              <div
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`border rounded-lg bg-card transition-all ${
                  draggedIndex === index ? 'opacity-50' : ''
                } ${expandedFields.has(index) ? 'shadow-sm' : ''}`}
              >
                {/* Compact Header */}
                <div className="flex items-center gap-2 p-3">
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left hover:text-foreground transition-colors">
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedFields.has(index) ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                    <span className="text-lg mr-1">
                      {fieldTypeIcons[field.type]}
                    </span>
                    <span className="font-mono font-medium text-sm">
                      {field.name || (
                        <span className="text-muted-foreground italic">
                          Unnamed field
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted border ml-1">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="text-red-500 font-bold">*</span>
                    )}
                  </CollapsibleTrigger>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(index)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Remove field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expandable Content */}
                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-1 space-y-4 border-t">
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`field-name-${index}`}
                          className="text-xs font-medium"
                        >
                          Field Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`field-name-${index}`}
                          value={field.name}
                          onChange={(e) =>
                            updateField(index, { name: e.target.value })
                          }
                          placeholder="e.g., registerDate"
                          className="font-mono text-sm h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={`field-type-${index}`}
                          className="text-xs font-medium"
                        >
                          Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) =>
                            updateField(index, {
                              type: value as ServiceFieldType,
                            })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">
                              <span className="flex items-center gap-2">
                                <span>📝</span>
                                <span>String</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="number">
                              <span className="flex items-center gap-2">
                                <span>🔢</span>
                                <span>Number</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="boolean">
                              <span className="flex items-center gap-2">
                                <span>✓/✗</span>
                                <span>Boolean</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="date">
                              <span className="flex items-center gap-2">
                                <span>📅</span>
                                <span>Date</span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`field-default-${index}`}
                          className="text-xs font-medium"
                        >
                          Default Value
                        </Label>
                        {field.type === 'boolean' ? (
                          <Select
                            value={
                              field.defaultValue === true
                                ? 'true'
                                : field.defaultValue === false
                                  ? 'false'
                                  : 'none'
                            }
                            onValueChange={(value) =>
                              updateField(index, {
                                defaultValue:
                                  value === 'none'
                                    ? undefined
                                    : value === 'true',
                              })
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={`field-default-${index}`}
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={field.defaultValue?.toString() || ''}
                            onChange={(e) =>
                              updateField(index, {
                                defaultValue:
                                  field.type === 'number'
                                    ? Number(e.target.value)
                                    : e.target.value,
                              })
                            }
                            placeholder="Optional"
                            className="h-9"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={`field-depends-${index}`}
                          className="text-xs font-medium"
                        >
                          Depends On
                        </Label>
                        <Select
                          value={field.dependsOn?.[0] || 'none'}
                          onValueChange={(value) => {
                            updateField(index, {
                              dependsOn: value === 'none' ? undefined : [value],
                            });
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              No dependencies
                            </SelectItem>
                            {fieldNames
                              .filter((name) => name !== field.name)
                              .map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`field-required-${index}`}
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          updateField(index, { required: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor={`field-required-${index}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        Required field
                      </Label>
                    </div>
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
