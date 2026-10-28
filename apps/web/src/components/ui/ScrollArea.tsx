'use client';

import * as React from 'react';

import { cn } from '@/shared/utils';

export type ScrollAreaProps = React.ComponentProps<'div'>;

function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div
      data-slot="scroll-area"
      className={cn('relative overflow-y-auto overflow-x-hidden scrollbar-thin', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { ScrollArea };
