'use client';

import { ServiceField, ServiceFieldValue } from '@/lib/types';
import { FieldValueDisplay } from './FieldValueDisplay';

interface ServiceFieldViewProps {
  field: ServiceField;
  value: ServiceFieldValue;
}

export function ServiceFieldView({ field, value }: ServiceFieldViewProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-0">
      <span className="text-xs text-muted-foreground">{field.name}:</span>
      <div className="text-xs">
        <FieldValueDisplay value={value} fieldType={field.type} />
      </div>
    </div>
  );
}
