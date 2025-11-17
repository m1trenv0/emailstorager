import { FilterCondition, ServiceField } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FilterForm } from '@/components/filters/FilterForm';

interface FilterCategory {
  id: string;
  name: string;
  serviceId: string;
  service: { name: string; fields: ServiceField[] };
}

interface FilterDialogProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  categories: FilterCategory[];
  initialData?: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
    showAsTab: boolean;
    tabOrder: number;
  };
  onSubmit: (data: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
    showAsTab: boolean;
    tabOrder: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export function FilterDialog({
  isOpen,
  mode,
  categories,
  initialData,
  onSubmit,
  onCancel,
}: FilterDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-2xl">
            {mode === 'create' ? 'Create Filter' : 'Edit Filter'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-6">
          <FilterForm
            initialData={initialData}
            categories={categories}
            onSubmit={onSubmit}
            onCancel={onCancel}
            mode={mode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
