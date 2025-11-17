'use client';

import { AliasCard } from '@/components/AliasCard';
import { AliasWithStatus, ServiceFieldValue } from '@/lib/types';

interface AccountAliasesListProps {
  aliases: AliasWithStatus[];
  onServiceFieldUpdate?: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onCommentUpdate?: (aliasId: string, comment: string) => Promise<void>;
  onAddService?: (aliasId: string, serviceName: string) => Promise<void>;
  onRemoveService?: (aliasId: string, serviceName: string) => Promise<void>;
}

export function AccountAliasesList({
  aliases,
  onServiceFieldUpdate,
  onCommentUpdate,
  onAddService,
  onRemoveService,
}: AccountAliasesListProps) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Aliases ({aliases.length})
      </h3>
      {aliases.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 sm:p-12 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            No aliases yet. Add your first alias to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {aliases.map((alias) => (
            <AliasCard
              key={alias.id}
              alias={alias}
              onServiceFieldUpdate={onServiceFieldUpdate}
              onCommentUpdate={onCommentUpdate}
              onAddService={onAddService}
              onRemoveService={onRemoveService}
            />
          ))}
        </div>
      )}
    </section>
  );
}
