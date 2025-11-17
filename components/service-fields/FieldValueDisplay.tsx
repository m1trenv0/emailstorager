'use client';

import { Badge } from '@/components/ui/badge';
import { ServiceFieldValue } from '@/lib/types';

interface FieldValueDisplayProps {
  value: ServiceFieldValue;
  fieldType: 'string' | 'number' | 'boolean' | 'date';
}

export function FieldValueDisplay({ value, fieldType }: FieldValueDisplayProps) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Not set</span>;
  }

  switch (fieldType) {
    case 'boolean':
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );

    case 'date':
      return (
        <span>
          {new Date(value as string | number).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      );

    default:
      return <span className="font-medium">{String(value)}</span>;
  }
}
