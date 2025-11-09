import { CheckCircle2, XCircle, Truck, Clock } from 'lucide-react';
import { ServiceStatus } from '@/lib/types';

interface StatusIconProps {
  status: ServiceStatus;
  className?: string;
}

export function StatusIcon({ status, className = '' }: StatusIconProps) {
  const icons = {
    registered: (
      <CheckCircle2
        className={`h-5 w-5 text-green-500 ${className}`}
        aria-label="Registered"
      />
    ),
    banned: (
      <XCircle
        className={`h-5 w-5 text-red-500 ${className}`}
        aria-label="Banned"
      />
    ),
    delivered: (
      <Truck
        className={`h-5 w-5 text-blue-500 ${className}`}
        aria-label="Delivered"
      />
    ),
    pending: (
      <Clock
        className={`h-5 w-5 text-yellow-500 ${className}`}
        aria-label="Pending"
      />
    ),
  };

  return icons[status];
}
