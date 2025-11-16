'use client';

import { Filter, FilterCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Filter as FilterIcon } from 'lucide-react';
import { useConfirm } from '@/lib/hooks/useConfirm';

interface FilterWithCategory extends Filter {
  category: FilterCategory & {
    service: { name: string };
  };
}

interface FilterListProps {
  filters: FilterWithCategory[];
  onEdit: (filter: FilterWithCategory) => void;
  onDelete: (filterId: string) => void;
}

export function FilterList({ filters, onEdit, onDelete }: FilterListProps) {
  const { confirm, ConfirmDialog } = useConfirm();

  if (filters.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <FilterIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
          <h3 className="mb-2 text-xl font-semibold">No filters yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Create your first filter to organize and filter your account data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filters.map((filter) => (
        <Card
          key={filter.id}
          className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg border-2 py-0"
        >
          <CardContent className="p-0 flex flex-col h-full">
            {/* Header with Actions */}
            <div className="bg-accent/50 p-3 border-b-2 flex items-center justify-between gap-3 px-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold truncate">{filter.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {filter.category.service.name}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {filter.category.name}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 border"
                  onClick={() => onEdit(filter)}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Delete Filter',
                      description: `Are you sure you want to delete "${filter.name}"? This action cannot be undone.`,
                      confirmText: 'Delete',
                      cancelText: 'Cancel',
                      variant: 'destructive',
                    });
                    if (confirmed) {
                      onDelete(filter.id);
                    }
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conditions - Fixed height area with scroll */}
            <div className="px-3 py-3 flex-1 min-h-[180px] max-h-[180px] overflow-y-auto">
              <div className="space-y-2">
                {filter.conditions.map((condition, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 text-sm bg-muted/80 rounded px-3 py-2 border">
                      <span className="font-semibold flex-1">{condition.field}</span>
                      <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-0.5 rounded flex-shrink-0 border">
                        {condition.operator}
                      </span>
                      {condition.value !== undefined && (
                        <code className="text-xs font-semibold bg-background border rounded px-2 py-0.5 flex-shrink-0 max-w-[40%] truncate">
                          {String(condition.value)}
                        </code>
                      )}
                    </div>
                    {idx < filter.conditions.length - 1 && (
                      <div className="text-xs font-bold text-center text-muted-foreground py-1">
                        AND
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-accent/30 px-3 py-2.5 border-t-2 mt-auto">
              <div className="flex items-center justify-between text-xs">
                <div className="font-semibold text-foreground">
                  {filter.conditions.length} condition{filter.conditions.length !== 1 && 's'}
                </div>
                {filter.showAsTab && (
                  <Badge variant="default" className="text-xs">
                    Tab #{filter.tabOrder}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <ConfirmDialog />
    </div>
  );
}
