'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  CheckSquare,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  LucideIcon,
  Settings,
  User as UserIcon,
} from 'lucide-react';

import { useProject } from '@/features/projects';
import { useWorkspaceContext } from '@/features/workspaces';

interface BreadcrumbNode {
  label: string;
  href: string;
  icon?: LucideIcon;
  isBrandLogo?: boolean;
  isLast: boolean;
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const { workspaces, activeWorkspace } = useWorkspaceContext();
  const segments = pathname.split('/').filter(Boolean);

  // Extract route parameters if present
  const isWorkspacesRoute = segments[0] === 'workspaces';
  const workspaceIdFromUrl =
    isWorkspacesRoute && segments[1] && segments[1] !== 'settings'
      ? segments[1]
      : undefined;

  const currentWorkspace = workspaceIdFromUrl
    ? (workspaces.find((w) => w.id === workspaceIdFromUrl) ?? activeWorkspace)
    : activeWorkspace;

  const projectIdFromUrl =
    isWorkspacesRoute && segments[2] === 'projects' && segments[3]
      ? segments[3]
      : undefined;

  const { data: project } = useProject(projectIdFromUrl ?? '');

  const workspaceName = currentWorkspace?.name || 'Workspace';
  const projectName = project?.name || 'Project';

  const items: BreadcrumbNode[] = [];
  const homeHref = activeWorkspace
    ? `/workspaces/${activeWorkspace.id}/dashboard`
    : '/dashboard';

  // 1. Root Crumb: Always SprintHub
  items.push({
    label: 'SprintHub',
    href: homeHref,
    isBrandLogo: true,
    isLast: false,
  });

  // 2. Resolve hierarchical crumbs based on pathname
  if (
    segments.length === 0 ||
    segments[0] === 'dashboard' ||
    (isWorkspacesRoute && segments[2] === 'dashboard')
  ) {
    if (workspaceIdFromUrl) {
      items.push({
        label: workspaceName,
        href: `/workspaces/${workspaceIdFromUrl}/projects`,
        icon: Briefcase,
        isLast: false,
      });
    }
    items.push({
      label: 'Dashboard',
      href: pathname,
      icon: LayoutDashboard,
      isLast: true,
    });
  } else if (segments[0] === 'profile') {
    items.push({
      label: 'My Profile',
      href: '/profile',
      icon: UserIcon,
      isLast: true,
    });
  } else if (isWorkspacesRoute && segments.length === 1) {
    items.push({
      label: 'Workspaces',
      href: '/workspaces',
      icon: Briefcase,
      isLast: true,
    });
  } else if (
    isWorkspacesRoute &&
    (segments[1] === 'settings' || segments[2] === 'settings')
  ) {
    if (workspaceIdFromUrl) {
      items.push({
        label: workspaceName,
        href: `/workspaces/${workspaceIdFromUrl}/projects`,
        icon: Briefcase,
        isLast: false,
      });
    }
    items.push({
      label: 'Workspace Settings',
      href: pathname,
      icon: Settings,
      isLast: true,
    });
  } else if (segments[0] === 'projects') {
    items.push({
      label: 'Projects Hub',
      href: '/projects',
      icon: FolderKanban,
      isLast: true,
    });
  } else if (segments[0] === 'tasks') {
    items.push({
      label: 'Tasks Hub',
      href: '/tasks',
      icon: CheckSquare,
      isLast: true,
    });
  } else if (isWorkspacesRoute && segments[2] === 'projects') {
    // We are inside a workspace projects context: /workspaces/[wsId]/projects/...
    if (workspaceIdFromUrl) {
      items.push({
        label: workspaceName,
        href: `/workspaces/${workspaceIdFromUrl}/projects`,
        icon: Briefcase,
        isLast: false,
      });
    }

    if (segments.length === 3) {
      // /workspaces/[wsId]/projects
      items.push({
        label: 'Projects',
        href: pathname,
        icon: FolderKanban,
        isLast: true,
      });
    } else if (segments.length >= 4) {
      // Inside a specific project
      const subSection = segments[4];
      const projectHref = `/workspaces/${workspaceIdFromUrl}/projects/${projectIdFromUrl}/tasks`;

      items.push({
        label: projectName,
        href: projectHref,
        icon: FolderKanban,
        isLast: !subSection,
      });

      if (subSection === 'tasks') {
        items.push({
          label: 'Task Board',
          href: pathname,
          icon: CheckSquare,
          isLast: true,
        });
      } else if (subSection === 'settings') {
        items.push({
          label: 'Project Settings',
          href: pathname,
          icon: Settings,
          isLast: true,
        });
      }
    }
  } else {
    items.push({
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      isLast: true,
    });
  }

  // Ensure only the very last element has isLast = true
  const lastIndex = items.length - 1;
  items.forEach((item, index) => {
    item.isLast = index === lastIndex;
  });

  return (
    <nav aria-label="Hierarchical navigation trail" className="flex items-center">
      <ol className="flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <li key={`${item.href}-${index}`} className="flex items-center gap-1.5 shrink-0">
              {index > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
              )}
              {item.isLast ? (
                <span
                  aria-current="page"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/60 px-2.5 py-1 font-semibold text-foreground shadow-2xs"
                >
                  {item.isBrandLogo ? (
                    <Image
                      src="/logo.png"
                      alt="SprintHub"
                      width={14}
                      height={14}
                      className="size-3.5 shrink-0 rounded object-contain"
                    />
                  ) : (
                    Icon && <Icon className="size-3.5 text-primary" />
                  )}
                  <span className="max-w-44 truncate">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  {item.isBrandLogo ? (
                    <Image
                      src="/logo.png"
                      alt="SprintHub"
                      width={14}
                      height={14}
                      className="size-3.5 shrink-0 rounded object-contain"
                    />
                  ) : (
                    Icon && <Icon className="size-3.5 text-muted-foreground" />
                  )}
                  <span className="max-w-36 truncate">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
