'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  ThemeToggle,
} from '@/components/ui';
import { NotificationBell } from '@/features/notifications';
import { GlobalCreateTaskDialog } from '@/features/tasks';
import { useTheme } from '@/providers/ThemeProvider';

import { AppSidebar } from './AppSidebar';
import { CommandPalette, CommandPaletteTrigger } from './CommandPalette';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { NavbarContextIndicator } from './NavbarContextIndicator';
import { UserNav } from './UserNav';

export function AppNavbar() {
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const pendingGTimestampRef = useRef<number>(0);

  // Global Keyboard Shortcuts (Ctrl+K, G-sequences, Alt+N, Alt+T, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          (activeElement as HTMLElement).isContentEditable);

      // Always allow Ctrl + K / Cmd + K even from inputs
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Ignore other single-letter shortcuts when user is typing in form fields
      if (isInput) {
        return;
      }

      // 1. Action: Alt + N -> New Task
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsCreateTaskOpen(true);
        return;
      }

      // 2. Action: Alt + T -> Toggle Theme
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // 3. Action: '?' -> Shortcuts Modal
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // 4. Navigation sequences: G then Key
      const now = Date.now();
      const isPendingG = now - pendingGTimestampRef.current < 1500;

      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'g') {
        pendingGTimestampRef.current = now;
        return;
      }

      if (isPendingG && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'd') {
          e.preventDefault();
          pendingGTimestampRef.current = 0;
          router.push('/dashboard');
        } else if (key === 'w') {
          e.preventDefault();
          pendingGTimestampRef.current = 0;
          router.push('/workspaces');
        } else if (key === 'p') {
          e.preventDefault();
          pendingGTimestampRef.current = 0;
          router.push('/projects');
        } else if (key === 't') {
          e.preventDefault();
          pendingGTimestampRef.current = 0;
          router.push('/tasks');
        } else if (key === 'u') {
          e.preventDefault();
          pendingGTimestampRef.current = 0;
          router.push('/profile');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, toggleTheme]);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 pr-4 pl-4 backdrop-blur-md md:pr-6 md:pl-6">
      {/* Left: Mobile Sidebar Drawer & Context-Aware Location Indicator */}
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
                title="Open navigation menu"
              />
            }
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" showCloseButton>
            <SheetTitle className="sr-only">Main Navigation</SheetTitle>
            <AppSidebar
              isCollapsed={false}
              onNavigate={() => setIsMobileMenuOpen(false)}
              className="w-full border-r-0"
            />
          </SheetContent>
        </Sheet>

        {/* Smart Contextual Location: Dashboard, Workspaces, or Workspace > Project pills */}
        <NavbarContextIndicator />
      </div>

      {/* Center: Command Palette Search Trigger (Ctrl + K) */}
      <div className="flex items-center justify-center px-1 sm:px-2">
        <CommandPaletteTrigger onClick={() => setIsCommandPaletteOpen(true)} />
      </div>

      {/* Right Actions: Quick Create Task, Theme, Notifications, User Profile */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <GlobalCreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          showTrigger={true}
        />
        <ThemeToggle />
        <NotificationBell />
        <UserNav onOpenShortcuts={() => setIsShortcutsOpen(true)} />
      </div>

      {/* Global Command Palette Overlay Modal */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
      />

      {/* Global Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsDialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen} />
    </header>
  );
}
