'use client';

import { CreateTaskDialog, CreateTaskDialogProps } from './CreateTaskDialog';

export type GlobalCreateTaskDialogProps = CreateTaskDialogProps;

export function GlobalCreateTaskDialog(props: GlobalCreateTaskDialogProps) {
  return (
    <CreateTaskDialog
      triggerClassName="gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-semibold shadow-2xs"
      {...props}
    />
  );
}
