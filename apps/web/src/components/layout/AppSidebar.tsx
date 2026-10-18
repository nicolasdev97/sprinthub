'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CheckSquare,
  FolderKanban,
  Layers,
  LayoutDashboard,
  LucideIcon,
  Settings,
} from 'lucide-react';

import { cn } from '@/shared/utils';
import { useWorkspaceContext } from '@/features/workspaces';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  matchExact?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    label: 'Workspace Settings',
    href: '/workspaces/settings',
    icon: Settings,
  },
];

interface AppSidebarProps {
  isCollapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.href === '/dashboard') {
    return (
      pathname === '/' ||
      pathname === '/dashboard' ||
      pathname.startsWith('/dashboard/') ||
      /^\/workspaces\/[^/]+\/dashboard(\/|$)/.test(pathname)
    );
  }

  if (item.href === '/tasks') {
    return (
      pathname === '/tasks' ||
      pathname.startsWith('/tasks/') ||
      /^\/workspaces\/[^/]+\/projects\/[^/]+\/tasks(\/|$)/.test(pathname)
    );
  }

  if (item.href === '/projects') {
    if (/^\/workspaces\/[^/]+\/projects\/[^/]+\/tasks(\/|$)/.test(pathname)) {
      return false;
    }

    return (
      pathname === '/projects' ||
      pathname.startsWith('/projects/') ||
      /^\/workspaces\/[^/]+\/projects(\/|$)/.test(pathname)
    );
  }

  if (item.href === '/workspaces/settings') {
    return (
      pathname === '/workspaces' ||
      pathname === '/workspaces/settings' ||
      /^\/workspaces\/[^/]+\/settings(\/|$)/.test(pathname)
    );
  }

  if (item.matchExact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppSidebar({
  isCollapsed = false,
  onNavigate,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspaceContext();

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        'flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out select-none',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-sidebar-border px-4',
          isCollapsed ? 'justify-center px-2' : 'gap-3'
        )}
      >
        <Link
          href={
            activeWorkspace
              ? `/workspaces/${activeWorkspace.id}/dashboard`
              : '/dashboard'
          }
          onClick={onNavigate}
          className="flex items-center gap-2.5 font-semibold tracking-tight text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-md"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-xs">
            <Layers className="size-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">SprintHub</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Workspace OS
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {!isCollapsed && (
          <p className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Navigation
          </p>
        )}

        <nav className="flex flex-col gap-1">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(pathname, item);
            const resolvedHref =
              item.href === '/dashboard'
                ? activeWorkspace
                  ? `/workspaces/${activeWorkspace.id}/dashboard`
                  : '/dashboard'
                : item.href === '/projects'
                  ? activeWorkspace
                    ? `/workspaces/${activeWorkspace.id}/projects`
                    : '/projects'
                  : item.href === '/workspaces/settings'
                    ? activeWorkspace
                      ? `/workspaces/${activeWorkspace.id}/settings`
                      : '/workspaces'
                    : item.href;

            return (
              <Link
                key={item.href}
                href={resolvedHref}
                onClick={onNavigate}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  isCollapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary"
                  />
                )}
                <Icon
                  className={cn(
                    'size-4 shrink-0 transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-sidebar-foreground'
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Active Workspace Footer Summary */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            'flex items-center rounded-lg bg-sidebar-accent/50 px-2.5 py-2 text-xs',
            isCollapsed ? 'justify-center px-1.5' : 'gap-2.5'
          )}
          title={
            activeWorkspace
              ? `Active Workspace: ${activeWorkspace.name}`
              : 'No active workspace selected'
          }
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary uppercase">
            {activeWorkspace ? activeWorkspace.name.slice(0, 2) : 'SH'}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sidebar-foreground">
                {activeWorkspace ? activeWorkspace.name : 'No Workspace'}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {activeWorkspace ? 'Active environment' : 'Select or create one'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

