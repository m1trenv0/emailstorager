import { AliasCard } from '@/components/AliasCard';
import { AliasWithStatus, ServiceFieldValue } from '@/lib/types';

interface UnregisteredTabProps {
  unregisteredAliases: AliasWithStatus[];
  onServiceFieldUpdate: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onCommentUpdate: (aliasId: string, comment: string) => Promise<void>;
}

export const UnregisteredTab = ({
  unregisteredAliases,
  onServiceFieldUpdate,
  onCommentUpdate,
}: UnregisteredTabProps) => {
  return (
    <div className="space-y-4">
      {unregisteredAliases.length === 0 ? (
        <div className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground">
            No unregistered aliases found.
          </p>
        </div>
      ) : (
        unregisteredAliases.map((alias) => (
          <AliasCard
            key={alias.id}
            alias={alias}
            onServiceFieldUpdate={onServiceFieldUpdate}
            onCommentUpdate={onCommentUpdate}
          />
        ))
      )}
    </div>
  );
};
