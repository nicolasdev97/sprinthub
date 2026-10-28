import { ReactNode } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

import { Button } from './Button';
import { cn } from '@/shared/utils';

export interface NotFoundStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  actionHref?: string;
  actionVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
}

export function NotFoundState({
  title,
  description,
  actionText,
  actionIcon,
  onAction,
  actionHref,
  actionVariant = 'default',
  className,
}: NotFoundStateProps) {
  const buttonContent = (
    <>
      {actionIcon}
      {actionText && <span>{actionText}</span>}
    </>
  );

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center',
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h2 className="text-base font-semibold text-foreground tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {(onAction || actionHref) && actionText && (
        <div className="mt-1">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant={actionVariant}>{buttonContent}</Button>
            </Link>
          ) : (
            <Button variant={actionVariant} onClick={onAction}>
              {buttonContent}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
