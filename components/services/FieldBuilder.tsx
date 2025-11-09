'use client';

import { useState } from 'react';
import { ServiceField, ServiceFieldType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, GripVertical, Plus } from 'lucide-react';

interface FieldBuilderProps {
  fields: ServiceField[];
  onChange: (fields: ServiceField[]) => void;
}

export function FieldBuilder({ fields, onChange }: FieldBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addField = () => {
    const newField: ServiceField = {
      name: '',
      type: 'string',
      required: false,
    };
    onChange([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<ServiceField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onChange(newFields);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
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
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fields</h3>
        <Button onClick={addField} size="sm" type="button">
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </header>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No fields added yet. Click "Add Field" to create your first field.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`cursor-move transition-opacity ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">
                      Field {index + 1}
                      {field.name && `: ${field.name}`}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`field-name-${index}`}>
                      Field Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`field-name-${index}`}
                      value={field.name}
                      onChange={(e) =>
                        updateField(index, { name: e.target.value })
                      }
                      placeholder="e.g., registerDate"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`field-type-${index}`}>
                      Type <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id={`field-type-${index}`}
                      value={field.type}
                      onChange={(e) =>
                        updateField(index, {
                          type: e.target.value as ServiceFieldType,
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`field-description-${index}`}>
                    Description
                  </Label>
                  <Textarea
                    id={`field-description-${index}`}
                    value={field.description || ''}
                    onChange={(e) =>
                      updateField(index, { description: e.target.value })
                    }
                    placeholder="Optional description for this field"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`field-default-${index}`}>
                      Default Value
                    </Label>
                    {field.type === 'boolean' ? (
                      <select
                        id={`field-default-${index}`}
                        value={
                          field.defaultValue === true
                            ? 'true'
                            : field.defaultValue === false
                              ? 'false'
                              : ''
                        }
                        onChange={(e) =>
                          updateField(index, {
                            defaultValue:
                              e.target.value === ''
                                ? undefined
                                : e.target.value === 'true',
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">None</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
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
                        placeholder="Optional default value"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`field-depends-${index}`}>Depends On</Label>
                    <select
                      id={`field-depends-${index}`}
                      multiple
                      value={field.dependsOn || []}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        updateField(index, { dependsOn: selected });
                      }}
                      className="flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      size={3}
                    >
                      {fieldNames
                        .filter((name) => name !== field.name)
                        .map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Hold Ctrl/Cmd to select multiple
                    </p>
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
                    className="cursor-pointer"
                  >
                    Required field
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
