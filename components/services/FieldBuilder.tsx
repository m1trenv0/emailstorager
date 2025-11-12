'use client';

import { useState } from 'react';
import { ServiceField, ServiceFieldType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        updateField(index, {
                          type: value as ServiceFieldType,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select default..." />
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
                        placeholder="Optional default value"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`field-depends-${index}`}>Depends On</Label>
                    <Select
                      value={field.dependsOn?.[0] || 'none'}
                      onValueChange={(value) => {
                        updateField(index, {
                          dependsOn: value === 'none' ? undefined : [value],
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="No dependencies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No dependencies</SelectItem>
                        {fieldNames
                          .filter((name) => name !== field.name)
                          .map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select a field this one depends on
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
