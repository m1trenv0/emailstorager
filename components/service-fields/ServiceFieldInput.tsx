'use client';

import { ServiceField, ServiceFieldValue } from '@/lib/types';
import {
  BooleanFieldInput,
  DateFieldInput,
  NumberFieldInput,
  StringFieldInput,
} from './index';

interface ServiceFieldInputProps {
  serviceName: string;
  field: ServiceField;
  value: ServiceFieldValue;
  isEditing: boolean;
  isUpdating: boolean;
  onChange: (value: ServiceFieldValue) => void;
}

export function ServiceFieldInput({
  serviceName,
  field,
  value,
  isEditing,
  isUpdating,
  onChange,
}: ServiceFieldInputProps) {
  const disabled = !isEditing || isUpdating;

  switch (field.type) {
    case 'boolean':
      return (
        <BooleanFieldInput
          serviceName={serviceName}
          fieldName={field.name}
          value={value as boolean}
          disabled={disabled}
          onChange={onChange}
        />
      );

    case 'date':
      return (
        <DateFieldInput
          serviceName={serviceName}
          fieldName={field.name}
          value={value as string | number | null}
          disabled={disabled}
          isEditing={isEditing}
          required={field.required}
          onChange={onChange}
        />
      );

    case 'number':
      return (
        <NumberFieldInput
          serviceName={serviceName}
          fieldName={field.name}
          value={value as number | null}
          disabled={disabled}
          required={field.required}
          onChange={onChange}
        />
      );

    case 'string':
    default:
      return (
        <StringFieldInput
          serviceName={serviceName}
          fieldName={field.name}
          value={value as string | null}
          disabled={disabled}
          required={field.required}
          description={field.description}
          onChange={onChange}
        />
      );
  }
}
