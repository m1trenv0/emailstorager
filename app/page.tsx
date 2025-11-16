'use client';

import { useEffect, useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddAliasModal } from '@/components/AddAliasModal';
import { AccountDetailsModal } from '@/components/AccountDetailsModal';
import { useAccountStore, useAllAccounts } from '@/lib/store/useAccountStore';
import {
  AccountWithAliases,
  AliasWithStatus,
  ServiceFieldValue,
  Service,
  Filter,
} from '@/lib/types';
import { Loader2 } from 'lucide-react';
import {
  useAddAccount,
  useDeleteAccount,
  useSelectAccount,
  useUpdateAccountServiceField,
  useAddServiceToAccount,
  useRemoveServiceFromAccount,
} from '@/lib/hooks/useAccountOperations';
import {
  useAddAlias,
  useUpdateAliasServiceField,
  useUpdateAliasComment,
  useAddServiceToAlias,
  useRemoveServiceFromAlias,
} from '@/lib/hooks/useAliasOperations';
import { SearchBar } from '@/components/SearchBar';
import { AllAccountsTab } from '@/components/tabs/AllAccountsTab';
import { UnregisteredTab } from '@/components/tabs/UnregisteredTab';
import { ServiceTab } from '@/components/tabs/ServiceTab';
import { FilterTab } from '@/components/tabs/FilterTab';
import { toast } from 'sonner';
import { useFetch } from '@/lib/hooks/useFetch';
import { useCacheInvalidation } from '@/lib/hooks/useCacheInvalidation';

export default function Home() {
  const { accounts, selectedAccountId, isLoading, error, fetchAccounts } =
    useAccountStore();

  const allAccounts = useAllAccounts();
  const [services, setServices] = useState<Service[]>([]);
  const [filters, setFilters] = useState<
    Array<Filter & { category: { service: { name: string } } }>
  >([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddAliasModalOpen, setIsAddAliasModalOpen] = useState(false);
  const [isAccountDetailsModalOpen, setIsAccountDetailsModalOpen] =
    useState(false);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] =
    useState<AccountWithAliases | null>(null);

  const { invalidateServices, invalidateFilters } = useCacheInvalidation();

  // Hooks for operations
  const addAccountMutation = useAddAccount();
  const deleteAccountMutation = useDeleteAccount();
  const selectAccountMutation = useSelectAccount();
  const updateAccountServiceFieldMutation = useUpdateAccountServiceField();
  const addServiceToAccountMutation = useAddServiceToAccount();
  const removeServiceFromAccountMutation = useRemoveServiceFromAccount();
  const addAliasMutation = useAddAlias();
  const updateAliasServiceFieldMutation = useUpdateAliasServiceField();
  const updateAliasCommentMutation = useUpdateAliasComment();
  const addServiceToAliasMutation = useAddServiceToAlias();
  const removeServiceFromAliasMutation = useRemoveServiceFromAlias();

  // Compute derived data
  const unregisteredAliases = useMemo(
    () =>
      allAccounts.flatMap((account) =>
        account.aliases.filter((alias) => {
          // Check if alias has no service registrations
          return Object.keys(alias.status).length === 0;
        })
      ),
    [allAccounts]
  );

  // Use cached fetch hooks for services and filters
  const { data: servicesData, loading: servicesLoading } = useFetch<Service[]>(
    '/api/services',
    {
      cache: true,
      cacheTTL: 30000, // 30 seconds
    }
  );

  const { data: filtersData, loading: filtersLoading } = useFetch<
    Array<Filter & { category: { service: { name: string } } }>
  >('/api/filters', {
    cache: true,
    cacheTTL: 30000, // 30 seconds
  });

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Derive services from servicesData
  useEffect(() => {
    if (servicesData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      setServices(servicesData);
    }
  }, [servicesData]);

  // Derive filters from filtersData
  useEffect(() => {
    if (filtersData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      setFilters(filtersData.filter((f) => f.showAsTab));
    }
  }, [filtersData]);

  // Derive loading state
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    setIsLoadingServices(servicesLoading || filtersLoading);
  }, [servicesLoading, filtersLoading]);

  // Get aliases by service dynamically
  const getAliasesByServiceName = (serviceName: string) => {
    return allAccounts.flatMap((account) =>
      account.aliases.filter((alias) => {
        const serviceStatus = alias.status[serviceName];
        return serviceStatus && Object.keys(serviceStatus).length > 0;
      })
    );
  };

  // Handlers
  const handleAddAccount = async (accountData: {
    primaryEmail: string;
    recoveryEmail: string;
    recoveryPassword: string;
  }) => {
    try {
      await addAccountMutation(accountData);
      toast.success('Account created successfully');
    } catch (error) {
      toast.error('Failed to create account', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccountMutation(accountId);
      toast.success('Account deleted successfully');
    } catch {
      toast.error('Failed to delete account');
    }
  };

  const handleSelectAccount = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (account) {
      setSelectedAccount(account);
      setIsAccountDetailsModalOpen(true);
      selectAccountMutation(accountId);
    }
  };

  const handleAddAlias = (accountId: string) => {
    setCurrentAccountId(accountId);
    setIsAddAliasModalOpen(true);
  };

  const handleAddAliasSubmit = async (
    email: string,
    countsTowardLimit: boolean
  ) => {
    if (!currentAccountId) return;

    try {
      await addAliasMutation(currentAccountId, email, countsTowardLimit);
      setIsAddAliasModalOpen(false);
      toast.success('Alias added successfully');
    } catch (error) {
      toast.error('Failed to add alias', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const handleUpdateAliasServiceField = async (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => {
    try {
      await updateAliasServiceFieldMutation(
        aliasId,
        serviceName,
        fieldName,
        value
      );
    } catch {
      toast.error('Failed to update service field');
    }
  };

  const handleUpdateAliasComment = async (aliasId: string, comment: string) => {
    try {
      await updateAliasCommentMutation(aliasId, comment);
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleAddServiceToAlias = async (
    aliasId: string,
    serviceName: string
  ) => {
    try {
      await addServiceToAliasMutation(aliasId, serviceName);
      toast.success('Service added successfully');
    } catch (error) {
      toast.error('Failed to add service', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
      throw error;
    }
  };

  const handleRemoveServiceFromAlias = async (
    aliasId: string,
    serviceName: string
  ) => {
    try {
      await removeServiceFromAliasMutation(aliasId, serviceName);
      toast.success('Service removed successfully');
    } catch {
      toast.error('Failed to remove service');
    }
  };

  const handleUpdateAccountServiceField = async (
    accountId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => {
    try {
      await updateAccountServiceFieldMutation(
        accountId,
        serviceName,
        fieldName,
        value
      );
    } catch {
      toast.error('Failed to update account service field');
    }
  };

  const handleAddServiceToAccount = async (
    accountId: string,
    serviceName: string
  ) => {
    try {
      await addServiceToAccountMutation(accountId, serviceName);
      toast.success('Service added to account successfully');
    } catch (error) {
      toast.error('Failed to add service to account', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
      throw error;
    }
  };

  const handleRemoveServiceFromAccount = async (
    accountId: string,
    serviceName: string
  ) => {
    try {
      await removeServiceFromAccountMutation(accountId, serviceName);
      toast.success('Service removed from account successfully');
    } catch {
      toast.error('Failed to remove service from account');
    }
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.recoveryEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || isLoadingServices) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all">All Accounts</TabsTrigger>
            <TabsTrigger value="unregistered">
              <span className="hidden sm:inline">Not Registered</span>
              <span className="sm:hidden">Unreg.</span>
              <span className="ml-1">({unregisteredAliases.length})</span>
            </TabsTrigger>
            {services.map((service) => {
              const count = getAliasesByServiceName(service.name).length;
              return (
                <TabsTrigger
                  key={service.id}
                  value={service.name.toLowerCase()}
                >
                  {service.name} ({count})
                </TabsTrigger>
              );
            })}
            {filters
              .sort((a, b) => a.tabOrder - b.tabOrder)
              .map((filter) => (
                <TabsTrigger key={filter.id} value={`filter-${filter.id}`}>
                  {filter.name}
                </TabsTrigger>
              ))}
          </TabsList>

          <TabsContent value="all" className="mt-4 sm:mt-6">
            <AllAccountsTab
              filteredAccounts={filteredAccounts}
              onAddAlias={handleAddAlias}
              onDelete={handleDeleteAccount}
              onSelect={handleSelectAccount}
              selectedAccountId={selectedAccountId}
            />
          </TabsContent>

          <TabsContent value="unregistered" className="mt-4 sm:mt-6">
            <UnregisteredTab
              unregisteredAliases={unregisteredAliases}
              onServiceFieldUpdate={handleUpdateAliasServiceField}
              onCommentUpdate={handleUpdateAliasComment}
              onAddService={handleAddServiceToAlias}
              onRemoveService={handleRemoveServiceFromAlias}
            />
          </TabsContent>

          {services.map((service) => {
            const serviceAliases = getAliasesByServiceName(service.name);
            return (
              <TabsContent
                key={service.id}
                value={service.name.toLowerCase()}
                className="mt-4 sm:mt-6"
              >
                <ServiceTab
                  aliases={serviceAliases}
                  serviceName={service.name}
                  onServiceFieldUpdate={handleUpdateAliasServiceField}
                  onCommentUpdate={handleUpdateAliasComment}
                  onAddService={handleAddServiceToAlias}
                  onRemoveService={handleRemoveServiceFromAlias}
                />
              </TabsContent>
            );
          })}

          {filters.map((filter) => {
            // Include both primary accounts and aliases
            const allAliases = allAccounts.flatMap((account) => [
              // Include primary account as an "alias" for filtering
              {
                id: account.id,
                accountId: account.id,
                email: account.primaryEmail,
                status: account.status,
                comments: null,
                createdAt: account.createdAt,
                countsTowardLimit: false,
              } as AliasWithStatus,
              // Include all aliases
              ...account.aliases,
            ]);
            return (
              <TabsContent
                key={filter.id}
                value={`filter-${filter.id}`}
                className="mt-4 sm:mt-6"
              >
                <FilterTab
                  allAliases={allAliases}
                  filter={filter}
                  serviceName={filter.category.service.name}
                  onServiceFieldUpdate={handleUpdateAliasServiceField}
                  onCommentUpdate={handleUpdateAliasComment}
                  onRemoveService={handleRemoveServiceFromAlias}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <AddAliasModal
        isOpen={isAddAliasModalOpen}
        onClose={() => setIsAddAliasModalOpen(false)}
        onSubmit={handleAddAliasSubmit}
      />

      <AccountDetailsModal
        isOpen={isAccountDetailsModalOpen}
        onClose={() => {
          setIsAccountDetailsModalOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        onAddAlias={handleAddAlias}
        onDelete={handleDeleteAccount}
        onServiceFieldUpdate={handleUpdateAliasServiceField}
        onUpdateAliasComment={handleUpdateAliasComment}
        onAddService={handleAddServiceToAlias}
        onRemoveService={handleRemoveServiceFromAlias}
        onAccountServiceFieldUpdate={handleUpdateAccountServiceField}
        onAddServiceToAccount={handleAddServiceToAccount}
        onRemoveServiceFromAccount={handleRemoveServiceFromAccount}
      />
    </>
  );
}
