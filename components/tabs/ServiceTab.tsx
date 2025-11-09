import { AliasCard } from '@/components/AliasCard';
import { AliasWithStatus, ServiceStatus } from '@/lib/types';

interface ServiceTabProps {
  aliases: AliasWithStatus[];
  serviceName: string;
  onStatusUpdate: (
    aliasId: string,
    service: 'aliexpress' | 'augment',
    status: ServiceStatus
  ) => Promise<void>;
  onCommentUpdate: (aliasId: string, comment: string) => Promise<void>;
}

export const ServiceTab = ({
  aliases,
  serviceName,
  onStatusUpdate,
  onCommentUpdate,
}: ServiceTabProps) => {
  return (
    <div className="space-y-4">
      {aliases.length === 0 ? (
        <div className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground">
            No {serviceName} aliases found.
          </p>
        </div>
      ) : (
        aliases.map((alias) => (
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