'use client';

import { useState } from 'react';
import { FilterCondition, ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { BasicFields } from './filter-form/BasicFields';
import { FilterConditionsSection } from './filter-form/FilterConditionsSection';
import { validateFilterForm } from '@/lib/utils/filter-validation';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateFilterForm(name, categoryId, conditions);
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
    setConditions([]);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-full">
      <div className="flex-1 overflow-y-auto px-1 space-y-4 min-h-0">
        <BasicFields
          name={name}
          categoryId={categoryId}
          showAsTab={showAsTab}
          tabOrder={tabOrder}
          categories={categories}
          mode={mode}
          onNameChange={setName}
          onCategoryChange={handleCategoryChange}
          onShowAsTabChange={setShowAsTab}
          onTabOrderChange={setTabOrder}
        />

        <div className="border-t my-4" />

        <FilterConditionsSection
          conditions={conditions}
          serviceFields={serviceFields}
          onConditionsChange={setConditions}
        />

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
