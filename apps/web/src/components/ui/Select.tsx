'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/utils';

export interface SelectProps extends Omit<React.ComponentProps<'select'>, 'onChange'> {
  onValueChange?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  icon?: React.ComponentType<{ className?: string }>;
}

function Select({
  className,
  children,
  onValueChange,
  onChange,
  icon: Icon,
  ...props
}: SelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  return (
    <div className={cn('relative inline-flex w-full items-center', className)}>
      {Icon && (
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground"
        />
      )}
      <select
        data-slot="select"
        onChange={handleChange}
        className={cn(
          'flex h-9 w-full appearance-none rounded-lg border border-input bg-background py-1 text-sm text-foreground shadow-2xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30',
          Icon ? 'pl-8 pr-7' : 'px-3 pr-8'
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground"
      />
    </div>
  );
}

function SelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return (
    <option
      data-slot="select-option"
      className={cn('bg-popover text-popover-foreground', className)}
      {...props}
    />
  );
}

export { Select, SelectOption };
