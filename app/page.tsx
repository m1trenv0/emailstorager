'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddAliasModal } from '@/components/AddAliasModal';
import { AccountDetailsModal } from '@/components/AccountDetailsModal';
import { useAccountStore, useAllAccounts } from '@/lib/store/useAccountStore';
import { Filter, ServiceField } from '@/lib/types';
import { SearchBar } from '@/components/SearchBar';
import { AllAccountsTab } from '@/components/tabs/AllAccountsTab';
import { FilterTab } from '@/components/tabs/FilterTab';
import { useFetch } from '@/lib/hooks/useFetch';
import { usePageHandlers } from '@/lib/hooks/usePageHandlers';
import { LoadingState, ErrorState } from '@/components/page/LoadingAndError';
import { filterAccounts, getAllAliases } from '@/lib/utils/page-utils';
import { useModalState } from '@/lib/hooks/useModalState';
import { usePageState } from '@/lib/hooks/usePageState';

export default function Home() {
  const { accounts, selectedAccountId, isLoading, error, fetchAccounts } = useAccountStore();
  const allAccounts = useAllAccounts();

  const [filters, setFilters] = useState<
    Array<Filter & { category: { service: { name: string; fields: ServiceField[] } } }>
  >([]);
  const pageState = usePageState();
  const { searchQuery, setSearchQuery, activeTab, setActiveTab } = pageState;

  const addAliasModal = useModalState();
  const accountDetailsModal = useModalState();

  const selectedAccountForModal = accountDetailsModal.currentId
    ? accounts.find((acc) => acc.id === accountDetailsModal.currentId) || null
    : null;

  const {
    handleDeleteAccount,
    handleSelectAccount,
    handleUpdateAliasServiceField,
    handleUpdateAliasComment,
    handleAddServiceToAlias,
    handleRemoveServiceFromAlias,
    handleUpdateAccountServiceField,
    handleAddServiceToAccount,
    handleRemoveServiceFromAccount,
    handleAddAlias,
  } = usePageHandlers();

  const { data: filtersData, loading: filtersLoading } = useFetch<
    Array<Filter & { category: { service: { name: string; fields: ServiceField[] } } }>
  >('/api/filters', {
    cache: true,
    cacheTTL: 30000,
  });

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (filtersData) {
      setFilters(filtersData.filter((f) => f.showAsTab));
    }
  }, [filtersData]);

  const handleSelectAccountForModal = (accountId: string) => {
    accountDetailsModal.open(accountId);
    handleSelectAccount(accountId, () => {});
  };

  const handleAddAliasClick = (accountId: string) => {
    addAliasModal.open(accountId);
  };

  const handleAddAliasSubmit = async (email: string, countsTowardLimit: boolean) => {
    if (!addAliasModal.currentId) return;

    try {
      await handleAddAlias(addAliasModal.currentId, email, countsTowardLimit);
      addAliasModal.close();
    } catch (error) {
      // Error already handled in hook with toast
    }
  };

  if (isLoading || filtersLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const filteredAccountsList = filterAccounts(accounts, searchQuery);
  const allAliases = getAllAliases(allAccounts);

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all">All Accounts</TabsTrigger>
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
              filteredAccounts={filteredAccountsList}
              onAddAlias={handleAddAliasClick}
              onDelete={handleDeleteAccount}
              onSelect={handleSelectAccountForModal}
              selectedAccountId={selectedAccountId}
            />
          </TabsContent>

          {filters.map((filter) => (
            <TabsContent
              key={filter.id}
              value={`filter-${filter.id}`}
              className="mt-4 sm:mt-6"
            >
              <FilterTab
                allAliases={allAliases}
                filter={filter}
                serviceName={filter.category.service.name}
                serviceFields={filter.category.service.fields}
                onServiceFieldUpdate={handleUpdateAliasServiceField}
                onAccountServiceFieldUpdate={handleUpdateAccountServiceField}
                onCommentUpdate={handleUpdateAliasComment}
                onRemoveService={handleRemoveServiceFromAlias}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AddAliasModal
        isOpen={addAliasModal.isOpen}
        onClose={addAliasModal.close}
        onSubmit={handleAddAliasSubmit}
      />

      <AccountDetailsModal
        isOpen={accountDetailsModal.isOpen}
        onClose={() => {
          accountDetailsModal.close();
        }}
        account={selectedAccountForModal}
        onAddAlias={handleAddAliasClick}
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
