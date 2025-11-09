'use client';

import { Filter, FilterCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Filter as FilterIcon } from 'lucide-react';

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
  if (filters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FilterIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No filters yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first filter to organize and filter your account data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filters.map((filter) => (
        <Card key={filter.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <header className="mb-2 flex items-center gap-2">
                  <FilterIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{filter.name}</h3>
                  <Badge variant="secondary">
                    {filter.category.service.name}
                  </Badge>
                </header>

                <div className="mb-3 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Category: {filter.category.name}
                  </p>
                  <div className="space-y-1">
                    {filter.conditions.map((condition, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
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

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(filter)}
                  title="Edit filter"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to delete "${filter.name}"? This action cannot be undone.`
                      )
                    ) {
                      onDelete(filter.id);
                    }
                  }}
                  title="Delete filter"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
