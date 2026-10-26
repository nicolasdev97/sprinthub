'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Compass, Keyboard, Sparkles, Terminal } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  icon: typeof Keyboard;
  items: ShortcutItem[];
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: 'Navigation (Go to)',
    icon: Compass,
    items: [
      { keys: ['G', 'then', 'D'], description: 'Go to Personal Dashboard' },
      { keys: ['G', 'then', 'W'], description: 'Go to Workspaces Hub' },
      { keys: ['G', 'then', 'P'], description: 'Go to Projects Hub' },
      { keys: ['G', 'then', 'T'], description: 'Go to Tasks Hub' },
      { keys: ['G', 'then', 'U'], description: 'Go to User Profile' },
    ],
  },
  {
    title: 'Quick Actions',
    icon: Sparkles,
    items: [
      { keys: ['Ctrl', 'K'], description: 'Open Command Palette / Search' },
      { keys: ['Alt', 'N'], description: 'Create New Task' },
      { keys: ['Alt', 'T'], description: 'Toggle Color Theme (Dark / Light)' },
    ],
  },
  {
    title: 'General',
    icon: Terminal,
    items: [
      { keys: ['?'], description: 'Open Keyboard Shortcuts' },
      { keys: ['Esc'], description: 'Close modal, palette, or drawer' },
    ],
  },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Keyboard className="size-4 text-primary" />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Navigate SprintHub at lightning speed without lifting your hands from the keyboard.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {SHORTCUT_SECTIONS.map((section) => {
            const SectionIcon = section.icon;

            return (
              <div key={section.title} className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                  <SectionIcon className="size-3.5 text-muted-foreground" />
                  <span>{section.title}</span>
                </div>

                <div className="rounded-lg border border-border/70 bg-card divide-y divide-border/50">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 text-xs"
                    >
                      <span className="text-muted-foreground">{item.description}</span>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {item.keys.map((k, kIdx) =>
                          k === 'then' || k === 'or' ? (
                            <span key={kIdx} className="text-[10px] text-muted-foreground/60 px-0.5">
                              {k}
                            </span>
                          ) : (
                            <kbd
                              key={kIdx}
                              className="inline-flex min-w-5 items-center justify-center rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-2xs"
                            >
                              {k === 'Ctrl' ? (
                                <>
                                  <span className="hidden sm:inline">Ctrl</span>
                                  <span className="sm:hidden">⌘</span>
                                </>
                              ) : (
                                k
                              )}
                            </kbd>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

