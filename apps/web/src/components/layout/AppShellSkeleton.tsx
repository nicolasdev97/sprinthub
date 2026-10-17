import { Separator, Skeleton } from '@/components/ui';

export function AppContentSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading page content">
      {/* Page Title & Action Skeleton */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* KPI / Summary Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Main Content Panel Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-background"
      aria-busy="true"
      aria-label="Loading application shell"
    >
      {/* Sidebar Skeleton */}
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <div className="flex-1 space-y-2 p-3">
          <Skeleton className="mb-3 h-3 w-20" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </aside>

      {/* Main Area Skeleton */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <Separator orientation="vertical" className="hidden h-5 md:block" />
            <Skeleton className="h-9 w-40 rounded-lg" />
            <Separator orientation="vertical" className="hidden h-5 md:block" />
            <Skeleton className="hidden h-4 w-28 md:block" />
          </div>
          <Skeleton className="size-8 rounded-full" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AppContentSkeleton />
        </main>
      </div>
    </div>
  );
}

