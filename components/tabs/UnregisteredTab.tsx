import { AliasCard } from '@/components/AliasCard';
import { AliasWithStatus, ServiceStatus } from '@/lib/types';

interface UnregisteredTabProps {
  unregisteredAliases: AliasWithStatus[];
  onStatusUpdate: (
    aliasId: string,
    service: 'aliexpress' | 'augment',
    status: ServiceStatus
  ) => Promise<void>;
  onCommentUpdate: (aliasId: string, comment: string) => Promise<void>;
}

export const UnregisteredTab = ({
  unregisteredAliases,
  onStatusUpdate,
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
            onStatusUpdate={onStatusUpdate}
            onCommentUpdate={onCommentUpdate}
          />
        ))
      )}
    </div>
  );
};