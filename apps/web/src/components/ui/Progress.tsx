'use client';

import * as React from 'react';

import { cn } from '@/shared/utils';

export interface ProgressProps extends React.ComponentProps<'div'> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

function Progress({
  className,
  value = 0,
  max = 100,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const percentage = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.round(value)}
      data-slot="progress"
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          'h-full rounded-full bg-primary transition-all duration-300 ease-in-out',
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export { Progress };

