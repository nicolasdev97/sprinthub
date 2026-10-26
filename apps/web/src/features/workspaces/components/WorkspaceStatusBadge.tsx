import { CheckCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui';
import { cn } from '@/shared/utils';

export function WorkspaceStatusBadge({
  isActive = true,
  className,
}: {
  isActive?: boolean;
  className?: string;
}) {
  if (!isActive) return null;

  return (
    <Badge
      variant="outline"
      className={cn('border-primary/40 text-primary', className)}
    >
      <CheckCircle2 className="size-3" />
      <span>Active</span>
    </Badge>
  );
}

