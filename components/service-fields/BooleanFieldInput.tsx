'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface BooleanFieldInputProps {
  serviceName: string;
  fieldName: string;
  value: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanFieldInput({
  serviceName,
  fieldName,
  value,
  disabled,
  onChange,
}: BooleanFieldInputProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`${serviceName}-${fieldName}`}
        checked={value === true}
        onCheckedChange={(checked) => onChange(checked === true)}
        disabled={disabled}
      />
      <Label
        htmlFor={`${serviceName}-${fieldName}`}
        className="text-xs font-normal cursor-pointer"
      >
        {fieldName}
      </Label>
    </div>
  );
}
