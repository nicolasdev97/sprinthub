'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import {
  Briefcase,
  CheckSquare,
  ChevronRight,
  FolderKanban,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { projectService } from '@/features/projects';
import { taskService } from '@/features/tasks';
import { useWorkspaceContext } from '@/features/workspaces';
import { cn } from '@/shared/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCreateTask?: () => void;
}

interface PaletteItem {
  id: string;
  category: 'Commands' | 'Projects' | 'Tasks' | 'Workspaces';
  title: string;
  subtitle?: string;
  badge?: string;
  onSelect: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenCreateTask,
}: CommandPaletteProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const { workspaces, setActiveWorkspaceId } = useWorkspaceContext();

  // Query projects for all workspaces
  const projectQueries = useQueries({
    queries: workspaces.map((ws) => ({
      queryKey: ['projects', ws.id],
      queryFn: () => projectService.getProjects(ws.id),
      enabled: Boolean(ws.id) && open,
    })),
  });

  const allProjects = useMemo(() => {
    return workspaces.flatMap((ws, idx) => {
      const projects = projectQueries[idx]?.data ?? [];
      return projects.map((p) => ({
        ...p,
        workspaceName: ws.name,
      }));
    });
  }, [workspaces, projectQueries]);

  // Query tasks for projects
  const taskQueries = useQueries({
    queries: allProjects.map((p) => ({
      queryKey: ['tasks', p.id],
      queryFn: () => taskService.getTasks(p.id),
      enabled: Boolean(p.id) && open,
    })),
  });

  const allTasks = useMemo(() => {
    return allProjects.flatMap((p, idx) => {
      const tasks = taskQueries[idx]?.data ?? [];
      return tasks.map((t) => ({
        ...t,
        workspaceId: p.workspaceId,
        workspaceName: p.workspaceName,
        projectName: p.name,
      }));
    });
  }, [allProjects, taskQueries]);

  // Build items array
  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];
    const term = searchQuery.trim().toLowerCase();

    // 1. Navigation / Quick Commands
    const commands: PaletteItem[] = [
      {
        id: 'cmd-create-task',
        category: 'Commands',
        title: 'Create New Task',
        subtitle: 'Quickly capture and assign a task',
        badge: 'Action',
        onSelect: () => {
          onOpenChange(false);
          onOpenCreateTask?.();
        },
      },
      {
        id: 'cmd-dashboard',
        category: 'Commands',
        title: 'Go to Dashboard',
        subtitle: 'Your personal home overview',
        onSelect: () => {
          onOpenChange(false);
          router.push('/dashboard');
        },
      },
      {
        id: 'cmd-workspaces',
        category: 'Commands',
        title: 'Go to Workspaces Hub',
        subtitle: 'View and manage all workspaces',
        onSelect: () => {
          onOpenChange(false);
          router.push('/workspaces');
        },
      },
      {
        id: 'cmd-projects',
        category: 'Commands',
        title: 'Go to Projects Hub',
        subtitle: 'Explore all projects across workspaces',
        onSelect: () => {
          onOpenChange(false);
          router.push('/projects');
        },
      },
      {
        id: 'cmd-tasks',
        category: 'Commands',
        title: 'Go to Tasks Hub',
        subtitle: 'Centralized tasks across projects',
        onSelect: () => {
          onOpenChange(false);
          router.push('/tasks');
        },
      },
    ];

    commands.forEach((cmd) => {
      if (!term || cmd.title.toLowerCase().includes(term) || cmd.subtitle?.toLowerCase().includes(term)) {
        list.push(cmd);
      }
    });

    // 2. Projects
    allProjects.forEach((project) => {
      if (
        !term ||
        project.name.toLowerCase().includes(term) ||
        project.workspaceName.toLowerCase().includes(term)
      ) {
        list.push({
          id: `proj-${project.id}`,
          category: 'Projects',
          title: project.name,
          subtitle: `${project.workspaceName} • ${project.status}`,
          badge: 'Project',
          onSelect: () => {
            onOpenChange(false);
            setActiveWorkspaceId(project.workspaceId);
            router.push(`/workspaces/${project.workspaceId}/projects/${project.id}/tasks`);
          },
        });
      }
    });

    // 3. Tasks
    allTasks.forEach((task) => {
      if (
        !term ||
        task.title.toLowerCase().includes(term) ||
        task.projectName.toLowerCase().includes(term) ||
        task.workspaceName.toLowerCase().includes(term)
      ) {
        list.push({
          id: `task-${task.id}`,
          category: 'Tasks',
          title: task.title,
          subtitle: `${task.workspaceName} / ${task.projectName}`,
          badge: task.status,
          onSelect: () => {
            onOpenChange(false);
            setActiveWorkspaceId(task.workspaceId);
            router.push(
              `/workspaces/${task.workspaceId}/projects/${task.projectId}/tasks?taskId=${task.id}`
            );
          },
        });
      }
    });

    // 4. Workspaces
    workspaces.forEach((ws) => {
      if (!term || ws.name.toLowerCase().includes(term)) {
        list.push({
          id: `ws-${ws.id}`,
          category: 'Workspaces',
          title: ws.name,
          subtitle: ws.description || 'View projects and workspace health',
          badge: 'Workspace',
          onSelect: () => {
            onOpenChange(false);
            setActiveWorkspaceId(ws.id);
            router.push(`/workspaces/${ws.id}/projects`);
          },
        });
      }
    });

    return list;
  }, [
    searchQuery,
    allProjects,
    allTasks,
    workspaces,
    router,
    setActiveWorkspaceId,
    onOpenChange,
    onOpenCreateTask,
  ]);

  const clampedIndex = items.length > 0 ? Math.min(selectedIndex, items.length - 1) : 0;

  const handleOpenDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
    onOpenChange(nextOpen);
  };

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = items[clampedIndex];
      if (current) {
        current.onSelect();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenDialogChange}>
      <DialogContent showCloseButton={false} className="p-0 sm:max-w-xl overflow-hidden gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette Search</DialogTitle>
          <DialogDescription>Quickly search workspaces, projects, and tasks</DialogDescription>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center border-b border-border/70 px-4 py-3 gap-3 bg-transparent">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search tasks, projects, workspaces..."
            className="flex-1 bg-transparent border-0 text-sm text-foreground placeholder:text-muted-foreground shadow-none outline-none focus:outline-none focus:ring-0"
            autoFocus
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(0);
              }}
              className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close command palette"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2 space-y-1 divide-y divide-border/40"
        >
          {items.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No results found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => item.onSelect()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2 text-xs cursor-pointer transition-colors pt-2',
                    isSelected
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {item.category === 'Commands' && (
                      <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                    )}
                    {item.category === 'Projects' && (
                      <FolderKanban className="size-3.5 text-sky-500 shrink-0" />
                    )}
                    {item.category === 'Tasks' && (
                      <CheckSquare className="size-3.5 text-emerald-500 shrink-0" />
                    )}
                    {item.category === 'Workspaces' && (
                      <Briefcase className="size-3.5 text-purple-500 shrink-0" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{item.title}</p>
                      {item.subtitle && (
                        <p className="truncate text-[11px] text-muted-foreground">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.badge && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="size-3 text-muted-foreground/60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>{' '}
              navigate
            </span>
            <span>
              <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>{' '}
              select
            </span>
          </div>
          <span>
            <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">
              esc
            </kbd>{' '}
            close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CommandPaletteTrigger({ onClick }: { onClick: () => void }) {
  return (
    <>
      {/* Desktop Search Trigger Pill */}
      <button
        type="button"
        onClick={onClick}
        className="hidden xl:flex items-center w-64 2xl:w-80 h-9 px-3 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted/70 text-xs text-muted-foreground transition-colors shadow-2xs cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open command palette"
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="size-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">Search tasks, projects, commands...</span>
        </div>
      </button>

      {/* Compact / Mobile Search Icon Button */}
      <button
        type="button"
        onClick={onClick}
        className="xl:hidden flex size-8 items-center justify-center rounded-lg border border-border/70 bg-muted/40 hover:bg-muted/70 text-muted-foreground transition-colors cursor-pointer"
        aria-label="Open search"
      >
        <Search className="size-3.5" />
      </button>
    </>
  );
}
