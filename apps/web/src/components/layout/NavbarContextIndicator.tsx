'use client';

import { usePathname } from 'next/navigation';
import {
  Briefcase,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  User as UserIcon,
} from 'lucide-react';

import { cn } from '@/shared/utils';
import { ProjectSelector } from './ProjectSelector';
import { WorkspaceSelector } from './WorkspaceSelector';

export function NavbarContextIndicator() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // 1. Root / Dashboard Page (Personal Home)
  if (segments.length === 0 || segments[0] === 'dashboard') {
    return (
      <div className="flex items-center gap-1.5 px-1 py-1 text-xs sm:text-sm font-semibold text-foreground">
        <LayoutDashboard className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Dashboard</span>
      </div>
    );
  }

  // 2. All Workspaces List Page
  if (segments[0] === 'workspaces' && segments.length === 1) {
    return (
      <div className="flex items-center gap-1.5 px-1 py-1 text-xs sm:text-sm font-semibold text-foreground">
        <Briefcase className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Workspaces Hub</span>
      </div>
    );
  }

  // 3. Global Projects Hub
  if (segments[0] === 'projects') {
    return (
      <div className="flex items-center gap-1.5 px-1 py-1 text-xs sm:text-sm font-semibold text-foreground">
        <FolderKanban className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Projects Hub</span>
      </div>
    );
  }

  // 4. Global Tasks Hub
  if (segments[0] === 'tasks') {
    return (
      <div className="flex items-center gap-1.5 px-1 py-1 text-xs sm:text-sm font-semibold text-foreground">
        <CheckSquare className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Tasks Hub</span>
      </div>
    );
  }

  // 5. User Profile Page
  if (segments[0] === 'profile') {
    return (
      <div className="flex items-center gap-1.5 px-1 py-1 text-xs sm:text-sm font-semibold text-foreground">
        <UserIcon className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Profile</span>
      </div>
    );
  }

  // 6. Inside a Specific Workspace Context (/workspaces/:workspaceId/...)
  if (segments[0] === 'workspaces' && segments[1] && segments[1] !== 'settings') {
    const isWorkspaceSettings = segments[2] === 'settings';
    const isInsideProject = segments[2] === 'projects' && Boolean(segments[3]);
    const subSection = isInsideProject ? segments[4] : undefined;

    return (
      <nav
        aria-label="Breadcrumb navigation"
        className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm overflow-x-hidden py-1"
      >
        {/* Workspace Selector (shown alone on mobile if at workspace level; hidden on mobile if inside a specific project to avoid crowding) */}
        <div className={cn(isInsideProject && 'hidden sm:inline-flex')}>
          <WorkspaceSelector />
        </div>

        {/* If inside workspace settings */}
        {isWorkspaceSettings && (
          <>
            <span className="text-muted-foreground/40 font-light select-none text-xs">/</span>
            <span className="px-1 text-xs sm:text-sm font-medium text-muted-foreground truncate max-w-[100px] sm:max-w-none">
              Settings
            </span>
          </>
        )}

        {/* If inside a specific project */}
        {isInsideProject && (
          <>
            <span className="hidden sm:inline text-muted-foreground/40 font-light select-none text-xs">
              /
            </span>
            <ProjectSelector />

            {/* Sub-view badge when inside a project's sub-route */}
            {subSection === 'tasks' && (
              <>
                <span className="hidden sm:inline text-muted-foreground/40 font-light select-none text-xs">
                  /
                </span>
                <span className="hidden sm:inline px-1 text-xs sm:text-sm font-medium text-muted-foreground">
                  Tasks
                </span>
              </>
            )}

            {subSection === 'settings' && (
              <>
                <span className="hidden sm:inline text-muted-foreground/40 font-light select-none text-xs">
                  /
                </span>
                <span className="hidden sm:inline px-1 text-xs sm:text-sm font-medium text-muted-foreground">
                  Settings
                </span>
              </>
            )}
          </>
        )}
      </nav>
    );
  }

  // Fallback default
  return (
    <div className="flex items-center gap-1.5 px-1 py-1 text-xs sm:text-sm font-semibold text-foreground">
      <LayoutDashboard className="size-4 text-muted-foreground" />
      <span className="hidden sm:inline">Dashboard</span>
    </div>
  );
}
