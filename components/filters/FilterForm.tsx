'use client';

import { useState } from 'react';
import { FilterCondition, ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ConditionBuilder } from './ConditionBuilder';
import { Loader2, AlertCircle, Plus } from 'lucide-react';

interface FilterFormProps {
  initialData?: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
    showAsTab?: boolean;
    tabOrder?: number;
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
    showAsTab: boolean;
    tabOrder: number;
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
  const [showAsTab, setShowAsTab] = useState(initialData?.showAsTab ?? false);
  const [tabOrder, setTabOrder] = useState(initialData?.tabOrder ?? 0);
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
        showAsTab,
        tabOrder,
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-full">
      <div className="flex-1 overflow-y-auto px-1 space-y-4 min-h-0">
        {/* Basic Fields */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="filter-name" className="text-sm font-medium">
              Filter Name
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="filter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Active Orders, Banned Accounts"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-category" className="text-sm font-medium">
              Category (Service)
              <span className="text-red-500 ml-1">*</span>
              {mode === 'edit' && (
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  (cannot be changed)
                </span>
              )}
            </Label>
            <Select
              value={categoryId}
              onValueChange={handleCategoryChange}
              disabled={mode === 'edit'}
            >
              <SelectTrigger
                className={
                  mode === 'edit' ? 'bg-muted cursor-not-allowed' : ''
                }
              >
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
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="show-as-tab"
              checked={showAsTab}
              onCheckedChange={(checked) =>
                setShowAsTab(checked as boolean)
              }
            />
            <Label htmlFor="show-as-tab" className="cursor-pointer text-sm">
              Show as tab
            </Label>
          </div>

          {showAsTab && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="tab-order" className="text-sm font-medium">
                Tab Order
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  (lower = first)
                </span>
              </Label>
              <Input
                id="tab-order"
                type="number"
                min="0"
                value={tabOrder}
                onChange={(e) => setTabOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="max-w-[120px]"
              />
            </div>
          )}
        </div>

        <div className="border-t my-4" />

        {/* Filter Conditions */}
        {serviceFields.length > 0 && (
          <div className="space-y-3 pb-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-foreground">
                Filter Conditions
              </h3>
              <Button
                onClick={() => {
                  const newCondition: FilterCondition = {
                    field: serviceFields[0]?.name || '',
                    operator: 'equals',
                    value: '',
                  };
                  setConditions([...conditions, newCondition]);
                }}
                size="sm"
                type="button"
                variant="outline"
                className="flex-shrink-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Condition
              </Button>
            </div>

            <ConditionBuilder
              conditions={conditions}
              serviceFields={serviceFields}
              onChange={setConditions}
            />

            {conditions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                All conditions must be met (AND logic) for the filter to match.
              </p>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex-shrink-0 flex justify-end gap-3 pt-6 border-t my-3 bg-background">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="min-w-[140px]"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Filter' : 'Update Filter'}
        </Button>
      </div>
    </form>
  );
}
