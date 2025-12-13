import { FilteredServiceCard } from '@/components/FilteredServiceCard';
import {
  AliasWithStatus,
  ServiceFieldValue,
  Filter,
  ServiceField,
  AccountWithAliases,
} from '@/lib/types';
import { filterAliases } from '@/lib/filter-utils';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Mail } from 'lucide-react';
import { QuickRegisterModal } from '@/components/QuickRegisterModal';
import { CopyEmailButton } from '@/components/ui/CopyEmailButton';

interface FilterTabProps {
  allAliases: AliasWithStatus[];
  accounts: AccountWithAliases[];
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
  accounts,
  filter,
  serviceName,
  serviceFields,
  onServiceFieldUpdate,
  onAccountServiceFieldUpdate,
  onCommentUpdate,
  onRemoveService,
}: FilterTabProps) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedAlias, setSelectedAlias] = useState<AliasWithStatus | null>(
    null
  );

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
            const account = accounts.find((a) => a.id === alias.accountId);

            return (
              <Card key={alias.id} className="w-full max-w-md">
                <CardContent className="space-y-2 pt-3 pb-3 px-3">
                  {/* Alias Email */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-xs font-medium text-muted-foreground break-all">
                        {alias.email}
                      </span>
                      <CopyEmailButton email={alias.email} size="icon" className="h-6 w-6" />
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

                  {/* Main Email */}
                  {account && (
                    <div className="flex items-center justify-between gap-2 pl-0.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground break-all">
                          {account.primaryEmail}
                        </span>
                        <CopyEmailButton
                          email={account.primaryEmail}
                          size="icon"
                          className="h-6 w-6"
                        />
                      </div>
                    </div>
                  )}

                  {alias.comments && (
                    <div className="pt-1 border-t">
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {alias.comments}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }

          const account = accounts.find((a) => a.id === alias.accountId);
          const isPrimaryEmail = account
            ? alias.email === account.primaryEmail
            : false;

          return (
            <FilteredServiceCard
              key={alias.id}
              alias={alias}
              serviceName={serviceName}
              onServiceFieldUpdate={
                isPrimaryEmail && onAccountServiceFieldUpdate
                  ? (id, service, field, value) =>
                      onAccountServiceFieldUpdate(id, service, field, value)
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
