'use client';

import { Service, AliasWithStatus, ServiceFieldValue } from '@/lib/types';
import { TabsContent } from '@/components/ui/tabs';
import { ServiceTab } from './ServiceTab';

interface DynamicServiceTabsProps {
  services: Service[];
  allAliases: AliasWithStatus[];
  onServiceFieldUpdate: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onCommentUpdate: (aliasId: string, comment: string) => Promise<void>;
}

export function DynamicServiceTabs({
  services,
  allAliases,
  onServiceFieldUpdate,
  onCommentUpdate,
}: DynamicServiceTabsProps) {
  // Filter aliases by service
  const getAliasesByService = (serviceName: string) => {
    return allAliases.filter((alias) => {
      // Check if alias has any fields for this service
      const serviceStatus = alias.status[serviceName];
      return serviceStatus && Object.keys(serviceStatus).length > 0;
    });
  };

  if (services.length === 0) {
    return null;
  }

  return (
    <>
      {services.map((service) => {
        const serviceAliases = getAliasesByService(service.name);
        return (
          <TabsContent key={service.id} value={service.name.toLowerCase()}>
            <ServiceTab
              aliases={serviceAliases}
              serviceName={service.name}
              onServiceFieldUpdate={onServiceFieldUpdate}
              onCommentUpdate={onCommentUpdate}
            />
          </TabsContent>
        );
      })}
    </>
  );
}
