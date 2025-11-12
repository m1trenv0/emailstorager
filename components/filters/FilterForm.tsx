'use client';

import { useState } from 'react';
import { FilterCondition, ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConditionBuilder } from './ConditionBuilder';
import { Loader2 } from 'lucide-react';

interface FilterFormProps {
  initialData?: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
  };
  categories: Array<{
    id: string;
    name: string;
    serviceId: string;
    service: { name: string; fields: ServiceField[] };
  }>;
  onSubmit: (data: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
  }) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export function FilterForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  mode,
}: FilterFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || categories[0]?.id || ''
  );
  const [conditions, setConditions] = useState<FilterCondition[]>(
    initialData?.conditions || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((cat) => cat.id === categoryId);
  const serviceFields = selectedCategory?.service.fields || [];

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return 'Filter name is required';
    }

    if (!categoryId) {
      return 'Category is required';
    }

    if (conditions.length === 0) {
      return 'At least one condition is required';
    }

    for (const condition of conditions) {
      if (!condition.field) {
        return 'All conditions must have a field selected';
      }

      const needsValue = [
        'equals',
        'not_equals',
        'contains',
        'not_contains',
        'gt',
        'gte',
        'lt',
        'lte',
      ].includes(condition.operator);

      if (
        needsValue &&
        (condition.value === undefined || condition.value === '')
      ) {
        return `Condition "${condition.field}" with operator "${condition.operator}" requires a value`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        categoryId,
        conditions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save filter');
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    // Reset conditions when category changes
    setConditions([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filter-name">
              Filter Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="filter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Active Orders, Banned Accounts"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-category">
              Category (Service) <span className="text-destructive">*</span>
            </Label>
            <Select
              value={categoryId}
              onValueChange={handleCategoryChange}
              disabled={mode === 'edit'}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.service.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">
                Category cannot be changed after creation
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {serviceFields.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <ConditionBuilder
              conditions={conditions}
              serviceFields={serviceFields}
              onChange={setConditions}
            />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <footer className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Filter' : 'Update Filter'}
        </Button>
      </footer>
    </form>
  );
}
