'use client';

import { useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import {
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';

import { AppSidebar } from './AppSidebar';
import { DynamicBreadcrumbs } from './DynamicBreadcrumbs';
import { UserNav } from './UserNav';
import { WorkspaceSelector } from './WorkspaceSelector';
import { NotificationBell } from '@/features/notifications';

interface AppNavbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function AppNavbar({ isSidebarCollapsed, onToggleSidebar }: AppNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xs md:px-6">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Sidebar Drawer */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
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

        {/* Desktop Sidebar Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden md:inline-flex"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>

        <Separator orientation="vertical" className="hidden h-5 md:block" />

        {/* Active Workspace Selector */}
        <WorkspaceSelector />

        <Separator orientation="vertical" className="hidden h-5 md:block" />

        {/* Dynamic Route Breadcrumbs */}
        <DynamicBreadcrumbs />
      </div>

      {/* Right Actions & User Profile Menu */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserNav />
      </div>
    </header>
  );
}

