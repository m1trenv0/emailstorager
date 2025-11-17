'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumberFieldInputProps {
  serviceName: string;
  fieldName: string;
  value: number | null;
  disabled: boolean;
  required?: boolean;
  onChange: (value: number | null) => void;
}

export function NumberFieldInput({
  serviceName,
  fieldName,
  value,
  disabled,
  required,
  onChange,
}: NumberFieldInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={`${serviceName}-${fieldName}`} className="text-xs">
        {fieldName}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={`${serviceName}-${fieldName}`}
        type="number"
        value={(value as number) ?? ''}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
        disabled={disabled}
        className="w-full text-xs h-7"
      />
    </div>
  );
}
