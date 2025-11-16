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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {filters.map((filter) => (
        <Card
          key={filter.id}
          className="overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/20 hover:border-l-primary"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <header className="mb-3 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FilterIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <h3 className="text-xl font-semibold">{filter.name}</h3>
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                      {filter.category.service.name}
                    </span>
                  </div>
                </header>

                <div className="mb-3 space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Category: {filter.category.name}
                  </p>
                  <div className="space-y-1">
                    {filter.conditions.map((condition, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm flex-wrap"
                      >
                        <Badge variant="outline">{condition.field}</Badge>
                        <span className="text-muted-foreground">
                          {condition.operator}
                        </span>
                        {condition.value !== undefined && (
                          <code className="rounded bg-muted px-2 py-1">
                            {String(condition.value)}
                          </code>
                        )}
                        {idx < filter.conditions.length - 1 && (
                          <span className="font-semibold text-muted-foreground">
                            AND
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(filter)}
                  title="Edit filter"
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
                  title="Delete filter"
                  className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <ConfirmDialog />
    </div>
  );
}
