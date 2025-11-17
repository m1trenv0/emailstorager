import { useState, useEffect, useMemo } from 'react';
import { ServiceField, ServiceFieldValue } from '@/lib/types';

export function useServiceFieldEditing(
  serviceFields: ServiceField[],
  currentValues: Record<string, ServiceFieldValue>,
  isEditing: boolean
) {
  const initialValues = useMemo(() => {
    const initial: Record<string, ServiceFieldValue> = {};
    serviceFields.forEach((field) => {
      initial[field.name] = currentValues[field.name] ?? null;
    });
    return initial;
  }, [currentValues, serviceFields]);

  const [editedValues, setEditedValues] = useState<Record<string, ServiceFieldValue>>(initialValues);

  useEffect(() => {
    if (!isEditing) {
      setEditedValues(initialValues);
    }
  }, [initialValues, isEditing]);

  const hasChanges = useMemo(() => {
    return serviceFields.some((field) => {
      const editedValue = editedValues[field.name];
      const currentValue = currentValues[field.name] ?? null;
      return editedValue !== currentValue;
    });
  }, [editedValues, currentValues, serviceFields]);

  const handleChange = (fieldName: string, value: ServiceFieldValue) => {
    setEditedValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const resetValues = () => {
    setEditedValues(initialValues);
  };

  const getChangedFields = () => {
    const changedFields: Array<{ name: string; value: ServiceFieldValue }> = [];
    for (const field of serviceFields) {
      const editedValue = editedValues[field.name];
      const currentValue = currentValues[field.name] ?? null;
      if (editedValue !== currentValue) {
        changedFields.push({ name: field.name, value: editedValue });
      }
    }
    return changedFields;
  };

  return {
    editedValues,
    hasChanges,
    handleChange,
    resetValues,
    getChangedFields,
  };
}
