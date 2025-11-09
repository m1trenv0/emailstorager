'use client';

import { useEffect, useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountCard } from '@/components/AccountCard';
import { AliasCard } from '@/components/AliasCard';
import { AddAccountForm } from '@/components/AddAccountForm';
import { AddAliasModal } from '@/components/AddAliasModal';
import { useAccountStore, useAllAccounts } from '@/lib/store/useAccountStore';
import { Input } from '@/components/ui/input';
import { ServiceStatus } from '@/lib/types';
import { Search, Loader2 } from 'lucide-react';

export default function Home() {
  const {
    accounts,
    selectedAccountId,
    isLoading,
    error,
    fetchAccounts,
    addAccount,
    deleteAccount,
    selectAccount,
    addAlias,
    updateAliasStatus,
    updateAliasComment,
  } = useAccountStore();

  const allAccounts = useAllAccounts();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddAliasModalOpen, setIsAddAliasModalOpen] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);

  // Compute derived data with useMemo to avoid infinite loops
  const unregisteredAliases = useMemo(
    () =>
      allAccounts.flatMap((account) =>
        account.aliases.filter(
          (alias) =>
            !alias.status.aliexpress &&
            !alias.status.augment &&
            alias.status.aliexpress !== 'registered' &&
            alias.status.augment !== 'registered'
        )
      ),
    [allAccounts]
  );

  const getAliasesByService = useMemo(
    () => (service: 'aliexpress' | 'augment') =>
      allAccounts.flatMap((account) =>
        account.aliases.filter((alias) => alias.status[service])
      ),
    [allAccounts]
  );

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = async (accountData: {
    primaryEmail: string;
    recoveryEmail: string;
    recoveryPassword: string;
  }) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create account');
      }

      const newAccount = await response.json();
      addAccount(newAccount);
    } catch (error) {
      console.error('Error adding account:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to create account'
      );
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      deleteAccount(accountId);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleAddAlias = async (accountId: string) => {
    setCurrentAccountId(accountId);
    setIsAddAliasModalOpen(true);
  };

  const handleAddAliasSubmit = async (
    email: string,
    countsTowardLimit: boolean
  ) => {
    if (!currentAccountId) return;

    try {
      const response = await fetch(
        `/api/accounts/${currentAccountId}/aliases`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            countsTowardLimit,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add alias');
      }

      const newAlias = await response.json();
      addAlias(currentAccountId, newAlias);
    } catch (error) {
      console.error('Error adding alias:', error);
      alert(error instanceof Error ? error.message : 'Failed to add alias');
    }
  };

  const handleUpdateAliasStatus = async (
    aliasId: string,
    service: 'aliexpress' | 'augment',
    status: ServiceStatus
  ) => {
    try {
      const response = await fetch(`/api/aliases/${aliasId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: { [service]: status },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      updateAliasStatus(aliasId, service, status);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleUpdateAliasComment = async (aliasId: string, comment: string) => {
    try {
      const response = await fetch(`/api/aliases/${aliasId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      updateAliasComment(aliasId, comment);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    }
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.recoveryEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
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
    <main className="container mx-auto min-h-screen p-6">
      <header className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Email Storage Manager</h1>
        <p className="text-muted-foreground">
          Manage your Outlook accounts and aliases with service status tracking
        </p>
      </header>

      <div className="mb-6">
        <AddAccountForm onSubmit={handleAddAccount} />
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Accounts</TabsTrigger>
          <TabsTrigger value="unregistered">
            Not Registered ({unregisteredAliases.length})
          </TabsTrigger>
          <TabsTrigger value="aliexpress">
            AliExpress ({getAliasesByService('aliexpress').length})
          </TabsTrigger>
          <TabsTrigger value="augment">
            Augment ({getAliasesByService('augment').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="all"
          className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {filteredAccounts.length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">
                  No accounts found. Add your first account to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onAddAlias={handleAddAlias}
                onDelete={handleDeleteAccount}
                onSelect={selectAccount}
                isSelected={selectedAccountId === account.id}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="unregistered" className="mt-6 space-y-4">
          {unregisteredAliases.length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">
                  No unregistered aliases found.
                </p>
              </CardContent>
            </Card>
          ) : (
            unregisteredAliases.map((alias) => (
              <AliasCard
                key={alias.id}
                alias={alias}
                onStatusUpdate={handleUpdateAliasStatus}
                onCommentUpdate={handleUpdateAliasComment}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="aliexpress" className="mt-6 space-y-4">
          {getAliasesByService('aliexpress').length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">
                  No AliExpress aliases found.
                </p>
              </CardContent>
            </Card>
          ) : (
            getAliasesByService('aliexpress').map((alias) => (
              <AliasCard
                key={alias.id}
                alias={alias}
                onStatusUpdate={handleUpdateAliasStatus}
                onCommentUpdate={handleUpdateAliasComment}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="augment" className="mt-6 space-y-4">
          {getAliasesByService('augment').length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">
                  No Augment aliases found.
                </p>
              </CardContent>
            </Card>
          ) : (
            getAliasesByService('augment').map((alias) => (
              <AliasCard
                key={alias.id}
                alias={alias}
                onStatusUpdate={handleUpdateAliasStatus}
                onCommentUpdate={handleUpdateAliasComment}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <AddAliasModal
        isOpen={isAddAliasModalOpen}
        onClose={() => setIsAddAliasModalOpen(false)}
        onSubmit={handleAddAliasSubmit}
      />
    </main>
  );
}
