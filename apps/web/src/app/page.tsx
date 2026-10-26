'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Filter,
  Flame,
  FolderKanban,
  Kanban,
  LayoutDashboard,
  List,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ThemeToggle,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { TaskPriorityBadge } from '@/features/tasks';

const CORE_FEATURES = [
  {
    icon: Kanban,
    title: 'Dual Kanban & List Views',
    description:
      'Visualize your sprint flow across Backlog, To Do, In Progress, Review, and Done—or switch to a high-density sortable table in one click.',
    badge: 'Execution',
    iconTone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Users,
    title: 'Multi-Workspace & Role Control',
    description:
      'Organize departments, squads, or clients into dedicated workspaces with granular Owner, Admin, and Member permissions.',
    badge: 'Collaboration',
    iconTone: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Workspace Analytics',
    description:
      'Monitor active tasks, completion rates, overdue bottlenecks, and priority distributions from an executive workspace dashboard.',
    badge: 'Insights',
    iconTone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: FolderKanban,
    title: 'Structured Project Lifecycle',
    description:
      'Guide initiatives from Planning to Active and Completed with live progress indicators and safe project archiving.',
    badge: 'Organization',
    iconTone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    icon: Flame,
    title: 'Priority & Deadline Triage',
    description:
      'Classify work by Low, Medium, High, or Critical urgency and surface upcoming deadlines assigned to each team member.',
    badge: 'Focus',
    iconTone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  {
    icon: Bell,
    title: 'In-App Notification Center',
    description:
      'Keep everyone in sync with instant notifications for task assignments, status transitions, and workspace updates.',
    badge: 'Alignment',
    iconTone: 'bg-primary/10 text-primary',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Launch your Workspace',
    description:
      'Create a dedicated space for your organization or team and invite collaborators with the right access role.',
  },
  {
    step: '02',
    title: 'Scope Projects & Priorities',
    description:
      'Break down initiatives into projects, assign owners, set due dates, and tag critical path items.',
  },
  {
    step: '03',
    title: 'Ship & Track Velocity',
    description:
      'Move tasks across the board, inspect details in the slide-over drawer, and measure delivery in real time.',
  },
];

const OLD_WAY_PAIN_POINTS = [
  {
    title: 'Scattered tasks across chats & spreadsheets',
    description:
      'Action items get buried in Slack threads, sticky notes, and outdated docs with no single source of truth.',
  },
  {
    title: 'Zero visibility into bottlenecks & deadlines',
    description:
      'Managers only discover a critical task is overdue after the release date has already slipped.',
  },
  {
    title: 'Bloated legacy tools that slow squads down',
    description:
      'Clunky interfaces and endless required fields make updating a simple task feel like paperwork.',
  },
  {
    title: 'Unclear ownership & tangled permissions',
    description:
      'External stakeholders, contractors, and internal engineers share messy access to sensitive projects.',
  },
];

const SPRINTHUB_ADVANTAGES = [
  {
    title: 'One unified Workspace OS from backlog to Done',
    description:
      'Every project, Kanban card, and sortable task list lives in a structured, searchable workspace.',
  },
  {
    title: 'Proactive priority triage & live KPI dashboards',
    description:
      'Spot Critical and High-priority items immediately and track real-time completion rates at a glance.',
  },
  {
    title: 'Fast, keyboard-friendly execution flow',
    description:
      'Switch between Kanban and List views in one click and update status, priority, or assignees inline.',
  },
  {
    title: 'Strict Role-Based Access Control (RBAC)',
    description:
      'Isolate teams and clients into separate workspaces with clear Owner, Admin, and Member permissions.',
  },
];

export default function LandingPage() {
  const { isAuthenticated, isInitializing } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg py-1 font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src="/logo.png"
              alt="SprintHub Logo"
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-lg object-contain"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">SprintHub</span>
              <span className="text-[11px] font-normal text-muted-foreground">Workspace OS</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#workflow" className="transition-colors hover:text-foreground">
              How it Works
            </a>
            <a href="#why-sprinthub" className="transition-colors hover:text-foreground">
              Why SprintHub
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {!isInitializing && isAuthenticated ? (
              <>
                <ThemeToggle />
                <Button size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
                  <LayoutDashboard className="size-4" />
                  <span>Go to Dashboard</span>
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Sign in
                </Button>
                <Button size="sm" nativeButton={false} render={<Link href="/register" />}>
                  <span>Get Started Free</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/40 via-background to-background pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge
                variant="secondary"
                className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium"
              >
                <Sparkles className="size-3.5 text-primary" />
                <span>Built for high-velocity engineering &amp; product teams</span>
              </Badge>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Coordinate projects, sprints, and tasks{' '}
                <span className="text-primary">without the chaos.</span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                SprintHub brings your workspaces, Kanban boards, task lists, and real-time delivery
                metrics into one fast, focused workspace OS—so your team always knows what ships
                next.
              </p>

              {/* Hero CTAs */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {!isInitializing && isAuthenticated ? (
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-6"
                    nativeButton={false}
                    render={<Link href="/dashboard" />}
                  >
                    <LayoutDashboard className="size-4" />
                    <span>Open Your Workspace</span>
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="w-full sm:w-auto px-6"
                      nativeButton={false}
                      render={<Link href="/register" />}
                    >
                      <span>Create Free Account</span>
                      <ArrowRight className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto px-6"
                      nativeButton={false}
                      render={<Link href="/login" />}
                    >
                      <span>Sign in to Your Account</span>
                    </Button>
                  </>
                )}
              </div>

              {/* Trust Highlights */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Multi-workspace RBAC
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Kanban &amp; List views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Live KPI analytics
                </span>
              </div>
            </div>

            {/* Hero Visual Anchor: Product Board Mockup */}
            <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-border bg-card/90 p-3 shadow-xl sm:p-5">
              {/* Mock Browser / App Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-rose-500/80" />
                  <span className="size-2.5 rounded-full bg-amber-500/80" />
                  <span className="size-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-semibold text-foreground">
                    Platform Launch
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                    Active
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>8 done</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-blue-500" />
                    <span>3 in progress</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-slate-400" />
                    <span>2 to do</span>
                  </span>
                </div>
              </div>

              {/* Single-Row Compact Tool Bar (Search, Status Filter, Kanban/List Switcher) */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-1 items-center gap-2 min-w-[220px]">
                  {/* Search input mock */}
                  <div className="flex h-8.5 w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 text-xs text-muted-foreground">
                    <Search className="size-3.5 shrink-0 text-muted-foreground/80" />
                    <span className="truncate">Search tasks...</span>
                  </div>

                  {/* Status filter dropdown mock */}
                  <div className="hidden sm:flex h-8.5 items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 text-xs text-foreground">
                    <Filter className="size-3 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Filter:</span>
                    <span className="font-medium">All Statuses</span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </div>
                </div>

                {/* View switcher */}
                <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
                  <span className="flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 font-semibold text-foreground shadow-2xs">
                    <Kanban className="size-3 text-primary" />
                    <span>Kanban Board</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 text-muted-foreground">
                    <List className="size-3" />
                    <span>List View</span>
                  </span>
                </div>
              </div>

              {/* Mock Kanban Board matching real TaskKanbanBoard */}
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Column 1: TO DO */}
                <div className="flex min-h-80 flex-col rounded-xl border border-border bg-muted/25 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                        To Do
                      </h3>
                      <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                        2
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-6 text-muted-foreground"
                      aria-label="Add task to To Do"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5">
                    {/* Card 1 */}
                    <Card className="cursor-default gap-3 py-3.5 transition-all hover:border-primary/50 hover:shadow-xs">
                      <CardHeader className="px-3.5 py-0">
                        <div className="flex items-center justify-between gap-2">
                          <TaskPriorityBadge priority="HIGH" />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-6 text-muted-foreground"
                            aria-label="Move task"
                          >
                            <ArrowRight className="size-3" />
                          </Button>
                        </div>
                        <CardTitle className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                          Design role-based invitation modal for workspace admins
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3.5 py-0">
                        <p className="mb-2.5 line-clamp-2 text-xs text-muted-foreground">
                          Allow workspace owners to invite members with Owner, Admin, or Member
                          roles.
                        </p>
                        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3 shrink-0" />
                            <span>Oct 28, 2026</span>
                          </span>
                          <Avatar
                            className="size-6 border border-border"
                            title="Assigned to Elena Rostova"
                          >
                            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                              ER
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 2 */}
                    <Card className="cursor-default gap-3 py-3.5 transition-all hover:border-primary/50 hover:shadow-xs">
                      <CardHeader className="px-3.5 py-0">
                        <div className="flex items-center justify-between gap-2">
                          <TaskPriorityBadge priority="MEDIUM" />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-6 text-muted-foreground"
                            aria-label="Move task"
                          >
                            <ArrowRight className="size-3" />
                          </Button>
                        </div>
                        <CardTitle className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                          Add debounced search and priority filters to task list
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3.5 py-0">
                        <p className="mb-2.5 line-clamp-2 text-xs text-muted-foreground">
                          Optimize multi-workspace task querying with instant keyword debounce.
                        </p>
                        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3 shrink-0" />
                            <span>Nov 02, 2026</span>
                          </span>
                          <Avatar
                            className="size-6 border border-border"
                            title="Assigned to Marcus Chen"
                          >
                            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                              MC
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Column 2: IN PROGRESS */}
                <div className="flex min-h-80 flex-col rounded-xl border border-border bg-muted/25 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                        In Progress
                      </h3>
                      <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                        2
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-6 text-muted-foreground"
                      aria-label="Add task to In Progress"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5">
                    {/* Card 1 */}
                    <Card className="cursor-default gap-3 py-3.5 transition-all hover:border-primary/50 hover:shadow-xs">
                      <CardHeader className="px-3.5 py-0">
                        <div className="flex items-center justify-between gap-2">
                          <TaskPriorityBadge priority="CRITICAL" />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-6 text-muted-foreground"
                            aria-label="Move task"
                          >
                            <ArrowRight className="size-3" />
                          </Button>
                        </div>
                        <CardTitle className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                          Implement JWT refresh token rotation &amp; session guard
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3.5 py-0">
                        <p className="mb-2.5 line-clamp-2 text-xs text-muted-foreground">
                          Handle seamless silent authentication refresh and auto-logout on expired
                          tokens.
                        </p>
                        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3 shrink-0" />
                            <span>Today</span>
                          </span>
                          <Avatar
                            className="size-6 border border-border"
                            title="Assigned to Sarah Connor"
                          >
                            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                              SC
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 2 */}
                    <Card className="cursor-default gap-3 py-3.5 transition-all hover:border-primary/50 hover:shadow-xs">
                      <CardHeader className="px-3.5 py-0">
                        <div className="flex items-center justify-between gap-2">
                          <TaskPriorityBadge priority="HIGH" />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-6 text-muted-foreground"
                            aria-label="Move task"
                          >
                            <ArrowRight className="size-3" />
                          </Button>
                        </div>
                        <CardTitle className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                          Build workspace analytics KPI grid and status breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3.5 py-0">
                        <p className="mb-2.5 line-clamp-2 text-xs text-muted-foreground">
                          Aggregate active projects, completion velocity, and overdue task count.
                        </p>
                        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3 shrink-0" />
                            <span>Oct 27, 2026</span>
                          </span>
                          <Avatar
                            className="size-6 border border-border"
                            title="Assigned to David Kim"
                          >
                            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                              DK
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Column 3: DONE */}
                <div className="flex min-h-80 flex-col rounded-xl border border-border bg-muted/25 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                        Done
                      </h3>
                      <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                        2
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-6 text-muted-foreground"
                      aria-label="Add task to Done"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5">
                    {/* Card 1 */}
                    <Card className="cursor-default gap-3 py-3.5 opacity-80 transition-all hover:border-primary/50 hover:shadow-xs">
                      <CardHeader className="px-3.5 py-0">
                        <div className="flex items-center justify-between gap-2">
                          <TaskPriorityBadge priority="HIGH" />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-6 text-muted-foreground"
                            aria-label="Move task"
                          >
                            <ArrowRight className="size-3" />
                          </Button>
                        </div>
                        <CardTitle className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold text-muted-foreground line-through">
                          Configure multi-tenant workspace schema &amp; API endpoints
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3.5 py-0">
                        <p className="mb-2.5 line-clamp-2 text-xs text-muted-foreground">
                          Setup PostgreSQL relationships and Prisma queries with workspace
                          isolation.
                        </p>
                        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3 shrink-0" />
                            <span>Oct 20, 2026</span>
                          </span>
                          <Avatar
                            className="size-6 border border-border"
                            title="Assigned to Elena Rostova"
                          >
                            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                              ER
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card 2 */}
                    <Card className="cursor-default gap-3 py-3.5 opacity-80 transition-all hover:border-primary/50 hover:shadow-xs">
                      <CardHeader className="px-3.5 py-0">
                        <div className="flex items-center justify-between gap-2">
                          <TaskPriorityBadge priority="LOW" />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-6 text-muted-foreground"
                            aria-label="Move task"
                          >
                            <ArrowRight className="size-3" />
                          </Button>
                        </div>
                        <CardTitle className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold text-muted-foreground line-through">
                          Launch dark mode and fluid theme switching tokens
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3.5 py-0">
                        <p className="mb-2.5 line-clamp-2 text-xs text-muted-foreground">
                          Refactor Tailwind color palette with OKLCH variables and system sync.
                        </p>
                        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3 shrink-0" />
                            <span>Oct 22, 2026</span>
                          </span>
                          <Avatar
                            className="size-6 border border-border"
                            title="Assigned to Alex Rivera"
                          >
                            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                              AR
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Mock Status Bar Footer communicating all 5 workflow stages */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">5 Workflow States:</span>
                  <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                    <span className="font-medium text-foreground/90">Backlog</span>
                    <span>·</span>
                    <span className="font-medium text-foreground/90">To Do</span>
                    <span>·</span>
                    <span className="font-medium text-foreground/90">In Progress</span>
                    <span>·</span>
                    <span className="font-medium text-foreground/90">In Review</span>
                    <span>·</span>
                    <span className="font-medium text-foreground/90">Done</span>
                  </div>
                </div>
                <span className="font-medium text-muted-foreground/80">
                  Showing Active Sprint · 3 Columns
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section id="features" className="scroll-mt-16 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3">
                Everything Your Team Needs
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Designed for clarity from backlog to release
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Stop jumping between disconnected spreadsheets and chat threads. SprintHub gives
                every contributor a single source of truth.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CORE_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl ${feature.iconTone}`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <Badge variant="secondary" className="text-[11px]">
                          {feature.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works / 3-Step Team Workflow */}
        <section
          id="workflow"
          className="scroll-mt-16 border-y border-border/60 bg-muted/20 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3">
                Simple Workflow
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Up and running with your team in minutes
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Whether you manage a startup squad or multiple client delivery streams, SprintHub
                adapts to your workflow.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {WORKFLOW_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-2xs"
                >
                  <div className="space-y-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                      {item.step}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why SprintHub Comparison Section */}
        <section
          id="why-sprinthub"
          className="scroll-mt-16 border-b border-border/60 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3">
                Why SprintHub
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Replace fragmented tools with one focused workspace
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                See how high-performing teams trade status-meeting fatigue and scattered trackers
                for predictable, transparent execution.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {/* Left Column: Before SprintHub */}
              <div className="flex flex-col justify-between rounded-2xl border border-border bg-muted/25 p-6 sm:p-8">
                <div>
                  <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-4">
                    <div>
                      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        The Old Way
                      </span>
                      <h3 className="mt-1 text-xl font-bold text-foreground">
                        Fragmented &amp; Reactive
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      Disconnected Tools
                    </Badge>
                  </div>

                  <ul className="mt-6 space-y-5">
                    {OLD_WAY_PAIN_POINTS.map((item) => (
                      <li key={item.title} className="flex items-start gap-3.5">
                        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                          <XCircle className="size-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 rounded-xl border border-dashed border-border bg-background/60 px-4 py-3 text-xs text-muted-foreground">
                  Result: More time spent chasing status updates than shipping product.
                </div>
              </div>

              {/* Right Column: With SprintHub */}
              <div className="relative flex flex-col justify-between rounded-2xl border-2 border-primary/25 bg-card p-6 shadow-md sm:p-8">
                <div>
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                        The SprintHub Way
                      </span>
                      <h3 className="mt-1 text-xl font-bold text-foreground">
                        Aligned &amp; High-Velocity
                      </h3>
                    </div>
                    <Badge className="gap-1">
                      <Sparkles className="size-3" />
                      <span>All-in-One OS</span>
                    </Badge>
                  </div>

                  <ul className="mt-6 space-y-5">
                    {SPRINTHUB_ADVANTAGES.map((item) => (
                      <li key={item.title} className="flex items-start gap-3.5">
                        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  <span>Result: Complete clarity on owners, priorities, and delivery health.</span>
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call To Action Section */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-lg sm:p-12">
              <div className="mx-auto max-w-2xl space-y-4">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
                  <Zap className="size-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Ready to align your team and ship faster?
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Create your free SprintHub account today or sign in to your workspace to start
                  organizing projects and tasks with your team.
                </p>

                <div className="pt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  {!isInitializing && isAuthenticated ? (
                    <Button
                      size="lg"
                      className="w-full sm:w-auto px-8"
                      nativeButton={false}
                      render={<Link href="/dashboard" />}
                    >
                      <LayoutDashboard className="size-4" />
                      <span>Go to Dashboard</span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto px-8"
                        nativeButton={false}
                        render={<Link href="/register" />}
                      >
                        <span>Create Free Account</span>
                        <ArrowRight className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto px-8"
                        nativeButton={false}
                        render={<Link href="/login" />}
                      >
                        <Lock className="size-4" />
                        <span>Sign in</span>
                      </Button>
                    </>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>Protected by role-based access control &amp; secure JWT sessions</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Image
              src="/logo.png"
              alt="SprintHub Logo"
              width={24}
              height={24}
              className="size-6 shrink-0 rounded-md object-contain"
            />
            <span>SprintHub</span>
          </div>
          <p>&copy; {new Date().getFullYear()} SprintHub. Built for modern software teams.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <Button
        type="button"
        size="icon"
        onClick={handleScrollToTop}
        aria-label="Scroll back to top"
        title="Back to top"
        className={`fixed right-6 bottom-6 z-40 size-10 rounded-full shadow-lg transition-all duration-200 ${
          showScrollTop
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <ArrowUp className="size-4" />
      </Button>
    </div>
  );
}
