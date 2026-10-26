import { CheckCheck, CheckCircle2, Clock } from 'lucide-react';

import { Badge } from '@/components/ui';
import { cn } from '@/shared/utils';

import { ProjectStatus } from '../types';

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge
          variant="secondary"
          className={cn(
            'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
            className
          )}
        >
          <CheckCircle2 className="size-3 text-blue-500" />
          <span>Active</span>
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge
          variant="secondary"
          className={cn(
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
            className
          )}
        >
          <CheckCheck className="size-3 text-emerald-500" />
          <span>Completed</span>
        </Badge>
      );
    case 'PLANNING':
    default:
      return (
        <Badge
          variant="secondary"
          className={cn(
            'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
            className
          )}
        >
          <Clock className="size-3 text-amber-500" />
          <span>Planning</span>
        </Badge>
      );
  }
}

