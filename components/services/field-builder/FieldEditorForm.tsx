import { ServiceField, ServiceFieldType } from '@/lib/types';
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

interface FieldEditorFormProps {
  field: ServiceField;
  index: number;
  fieldNames: string[];
  onUpdate: (updates: Partial<ServiceField>) => void;
}

export function FieldEditorForm({
  field,
  index,
  fieldNames,
  onUpdate,
}: FieldEditorFormProps) {
  return (
    <div className="px-3 pb-3 pt-1 space-y-4 border-t">
      <div className="grid grid-cols-2 gap-3 pt-3">
        <div className="space-y-2">
          <Label htmlFor={`field-name-${index}`} className="text-xs font-medium">
            Field Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`field-name-${index}`}
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g., registerDate"
            className="font-mono text-sm h-9"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`field-type-${index}`} className="text-xs font-medium">
            Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={field.type}
            onValueChange={(value) =>
              onUpdate({ type: value as ServiceFieldType })
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
          <Label htmlFor={`field-default-${index}`} className="text-xs font-medium">
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
                onUpdate({
                  defaultValue:
                    value === 'none' ? undefined : value === 'true',
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
                onUpdate({
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
          <Label htmlFor={`field-depends-${index}`} className="text-xs font-medium">
            Depends On
          </Label>
          <Select
            value={field.dependsOn?.[0] || 'none'}
            onValueChange={(value) => {
              onUpdate({
                dependsOn: value === 'none' ? undefined : [value],
              });
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="None" />
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
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`field-required-${index}`}
          checked={field.required}
          onCheckedChange={(checked) =>
            onUpdate({ required: checked as boolean })
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
  );
}
