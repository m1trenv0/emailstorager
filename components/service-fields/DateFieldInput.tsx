'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface DateFieldInputProps {
  serviceName: string;
  fieldName: string;
  value: string | number | null;
  disabled: boolean;
  isEditing: boolean;
  required?: boolean;
  onChange: (value: string | null) => void;
}

export function DateFieldInput({
  serviceName,
  fieldName,
  value,
  disabled,
  isEditing,
  required,
  onChange,
}: DateFieldInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={`${serviceName}-${fieldName}`} className="text-xs">
        {fieldName}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex gap-1">
        <Input
          id={`${serviceName}-${fieldName}`}
          type="date"
          value={
            value
              ? new Date(value as string | number).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) =>
            onChange(
              e.target.value ? new Date(e.target.value).toISOString() : null
            )
          }
          disabled={disabled}
          className="flex-1 text-xs h-7"
        />
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs whitespace-nowrap"
            onClick={() => onChange(new Date().toISOString())}
            disabled={disabled}
          >
            Today
          </Button>
        )}
      </div>
    </div>
  );
}
