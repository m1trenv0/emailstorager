import { FilteredServiceCard } from '@/components/FilteredServiceCard';
import { AliasWithStatus, ServiceFieldValue, Filter, ServiceField } from '@/lib/types';
import { filterAliases } from '@/lib/filter-utils';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { QuickRegisterModal } from '@/components/QuickRegisterModal';

interface FilterTabProps {
  allAliases: AliasWithStatus[];
  filter: Filter;
  serviceName: string;
  serviceFields: ServiceField[];
  onServiceFieldUpdate: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onAccountServiceFieldUpdate?: (
    accountId: string,
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
  serviceFields,
  onServiceFieldUpdate,
  onAccountServiceFieldUpdate,
  onCommentUpdate,
  onRemoveService,
}: FilterTabProps) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedAlias, setSelectedAlias] = useState<AliasWithStatus | null>(null);

  const filteredAliases = useMemo(() => {
    return filterAliases(allAliases, filter.conditions, serviceName);
  }, [allAliases, filter.conditions, serviceName]);

  // Check if this filter is using "not_exists" for service registration
  const hasNotExistsServiceRegistration = filter.conditions.some(
    (condition) =>
      condition.field === SERVICE_REGISTRATION_FIELD &&
      condition.operator === 'not_exists'
  );

  const handleQuickRegister = (alias: AliasWithStatus) => {
    setSelectedAlias(alias);
    setRegisterModalOpen(true);
  };

  const handleCloseModal = () => {
    setRegisterModalOpen(false);
    setSelectedAlias(null);
  };

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
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 flex-1 min-w-0">
                      <h4 className="text-sm font-semibold leading-none break-all">
                        {alias.email}
                      </h4>
                      <Badge variant="secondary" className="text-xs w-fit">
                        Not Registered
                      </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded-md hover:bg-muted flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickRegister(alias);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
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
              onServiceFieldUpdate={
                alias.id === alias.accountId && onAccountServiceFieldUpdate
                  ? (id, service, field, value) => onAccountServiceFieldUpdate(id, service, field, value)
                  : onServiceFieldUpdate
              }
              onCommentUpdate={onCommentUpdate}
              onRemoveService={onRemoveService}
            />
          );
        })
      )}
      {selectedAlias && (
        <QuickRegisterModal
          isOpen={registerModalOpen}
          onClose={handleCloseModal}
          aliasEmail={selectedAlias.email}
          serviceName={serviceName}
          serviceFields={serviceFields}
          onSubmit={onServiceFieldUpdate}
          aliasId={selectedAlias.id}
        />
      )}
    </div>
  );
};
