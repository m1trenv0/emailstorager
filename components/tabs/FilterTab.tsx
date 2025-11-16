import { FilteredServiceCard } from '@/components/FilteredServiceCard';
import { AliasWithStatus, ServiceFieldValue, Filter } from '@/lib/types';
import { filterAliases } from '@/lib/filter-utils';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  onRemoveService?: (aliasId: string, serviceName: string) => Promise<void>;
}

const SERVICE_REGISTRATION_FIELD = '__service_registered__';

export const FilterTab = ({
  allAliases,
  filter,
  serviceName,
  onServiceFieldUpdate,
  onCommentUpdate,
  onRemoveService,
}: FilterTabProps) => {
  const filteredAliases = useMemo(() => {
    return filterAliases(allAliases, filter.conditions, serviceName);
  }, [allAliases, filter.conditions, serviceName]);

  // Check if this filter is using "not_exists" for service registration
  const hasNotExistsServiceRegistration = filter.conditions.some(
    (condition) =>
      condition.field === SERVICE_REGISTRATION_FIELD &&
      condition.operator === 'not_exists'
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAliases.length === 0 ? (
        <div className="col-span-full flex h-32 items-center justify-center">
          <p className="text-muted-foreground">
            No aliases match this filter criteria.
          </p>
        </div>
      ) : (
        filteredAliases.map((alias) => {
          // If the alias doesn't have this service and the filter is checking for not_exists,
          // show a simplified card
          const hasService = !!(
            alias.status[serviceName] &&
            typeof alias.status[serviceName] === 'object' &&
            Object.keys(alias.status[serviceName] as object).length > 0
          );

          if (!hasService && hasNotExistsServiceRegistration) {
            return (
              <Card key={alias.id} className="w-full max-w-md">
                <CardContent className="space-y-3 pt-4 pb-4 px-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold leading-none break-all">
                      {alias.email}
                    </h4>
                    <Badge variant="secondary" className="text-xs w-fit">
                      Not Registered
                    </Badge>
                  </div>
                  <div className="rounded border border-dashed bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground text-center">
                      This account is not registered on {serviceName}
                    </p>
                  </div>
                  {alias.comments && (
                    <div className="rounded bg-muted px-3 py-2">
                      <p className="text-xs font-medium mb-1">Comments:</p>
                      <p className="text-xs whitespace-pre-wrap">
                        {alias.comments}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }

          return (
            <FilteredServiceCard
              key={alias.id}
              alias={alias}
              serviceName={serviceName}
              onServiceFieldUpdate={onServiceFieldUpdate}
              onCommentUpdate={onCommentUpdate}
              onRemoveService={onRemoveService}
            />
          );
        })
      )}
    </div>
  );
};
