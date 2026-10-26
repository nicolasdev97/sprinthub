'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LucideIcon,
} from 'lucide-react';

import { cn } from '@/shared/utils';

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
    label: 'Workspaces',
    href: '/workspaces',
    icon: Briefcase,
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

  // Inside a specific project context (/workspaces/:workspaceId/projects/:projectId/...)
  const isInsideSpecificProject = /^\/workspaces\/[^/]+\/projects\/[^/]+(\/|$)/.test(pathname);

  if (item.href === '/projects') {
    return (
      pathname === '/projects' ||
      pathname.startsWith('/projects/') ||
      isInsideSpecificProject
    );
  }

  if (item.href === '/workspaces') {
    if (/^\/workspaces\/[^/]+\/dashboard(\/|$)/.test(pathname)) {
      return false;
    }
    // When inside a specific project, active item shifts to Projects
    if (isInsideSpecificProject) {
      return false;
    }
    return pathname === '/workspaces' || pathname.startsWith('/workspaces/');
  }

  if (item.href === '/tasks') {
    return pathname === '/tasks' || pathname.startsWith('/tasks/');
  }

  if (item.matchExact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppSidebar({ isCollapsed = false, onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname();

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
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 font-semibold tracking-tight text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-md"
        >
          <Image
            src="/logo.png"
            alt="SprintHub Logo"
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-lg object-contain"
            priority
          />
          {!isCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">SprintHub</span>
              <span className="text-[11px] font-normal text-muted-foreground">Workspace OS</span>
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
            const resolvedHref = item.href;

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
    </aside>
  );
}
