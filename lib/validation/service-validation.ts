import { ServiceField } from '@/lib/types';

export function validateServiceForm(
  name: string,
  fields: ServiceField[]
): string | null {
  if (!name.trim()) {
    return 'Service name is required';
  }

  if (fields.length === 0) {
    return 'At least one field is required';
  }

  const fieldNames = new Set<string>();
  for (const field of fields) {
    if (!field.name.trim()) {
      return 'All fields must have a name';
    }

    if (fieldNames.has(field.name)) {
      return `Duplicate field name: ${field.name}`;
    }

    fieldNames.add(field.name);

    // Validate dependencies
    if (field.dependsOn) {
      for (const dep of field.dependsOn) {
        if (!fieldNames.has(dep)) {
          return `Field "${field.name}" depends on "${dep}" which appears later in the list`;
        }
      }
    }
  }

  return null;
}
