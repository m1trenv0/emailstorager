'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StringFieldInputProps {
  serviceName: string;
  fieldName: string;
  value: string | null;
  disabled: boolean;
  required?: boolean;
  description?: string;
  onChange: (value: string | null) => void;
}

export function StringFieldInput({
  serviceName,
  fieldName,
  value,
  disabled,
  required,
  description,
  onChange,
}: StringFieldInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={`${serviceName}-${fieldName}`} className="text-xs">
        {fieldName}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={`${serviceName}-${fieldName}`}
        type="text"
        value={(value as string) ?? ''}
        onChange={(e) => {
          const newValue = e.target.value || null;
          onChange(newValue);
        }}
        disabled={disabled}
        className="w-full text-xs h-7"
        placeholder={description}
      />
    </div>
  );
}
