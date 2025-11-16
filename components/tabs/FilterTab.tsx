import { AliasCard } from '@/components/AliasCard';
import { AliasWithStatus, ServiceFieldValue, Filter } from '@/lib/types';
import { filterAliases } from '@/lib/filter-utils';
import { useMemo } from 'react';

interface FilterTabProps {
  allAliases: AliasWithStatus[];
  filter: Filter;
  serviceName: string;
  onServiceFieldUpdate: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onCommentUpdate: (aliasId: string, comment: string) => Promise<void>;
  onAddService?: (aliasId: string, serviceName: string) => Promise<void>;
  onRemoveService?: (aliasId: string, serviceName: string) => Promise<void>;
}

export const FilterTab = ({
  allAliases,
  filter,
  serviceName,
  onServiceFieldUpdate,
  onCommentUpdate,
  onAddService,
  onRemoveService,
}: FilterTabProps) => {
  const filteredAliases = useMemo(() => {
    return filterAliases(allAliases, filter.conditions, serviceName);
  }, [allAliases, filter.conditions, serviceName]);

  return (
    <div className="space-y-4">
      {filteredAliases.length === 0 ? (
        <div className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground">
            No aliases match this filter criteria.
          </p>
        </div>
      ) : (
        filteredAliases.map((alias) => (
          <AliasCard
            key={alias.id}
            alias={alias}
            onServiceFieldUpdate={onServiceFieldUpdate}
            onCommentUpdate={onCommentUpdate}
            onAddService={onAddService}
            onRemoveService={onRemoveService}
          />
        ))
      )}
    </div>
  );
};
