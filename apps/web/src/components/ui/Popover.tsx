'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { cn } from '@/shared/utils';

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ className, ...props }: PopoverPrimitive.Trigger.Props) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn('outline-none', className)}
      {...props}
    />
  );
}

interface PopoverContentProps extends PopoverPrimitive.Popup.Props {
  sideOffset?: PopoverPrimitive.Positioner.Props['sideOffset'];
  align?: PopoverPrimitive.Positioner.Props['align'];
  side?: PopoverPrimitive.Positioner.Props['side'];
}

function PopoverContent({
  className,
  sideOffset = 8,
  align = 'end',
  side = 'bottom',
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        sideOffset={sideOffset}
        align={align}
        side={side}
        className="z-50 outline-none"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'z-50 w-80 overflow-hidden rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 transition-[transform,scale,opacity] duration-150',
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
