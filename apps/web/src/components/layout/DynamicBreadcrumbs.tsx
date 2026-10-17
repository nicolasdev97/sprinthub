'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  tasks: 'Tasks',
  workspaces: 'Workspaces',
  settings: 'Settings',
  members: 'Members',
  profile: 'Profile',
};

function formatSegmentLabel(segment: string): string {
  if (ROUTE_LABELS[segment]) {
    return ROUTE_LABELS[segment];
  }

  // Shorten UUID-like segments for clean breadcrumb display
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(segment) || segment.length > 20) {
    return `#${segment.slice(0, 8)}`;
  }

  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbItems =
    segments.length === 0
      ? [{ label: 'Dashboard', href: '/dashboard', isLast: true }]
      : segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          return {
            label: formatSegmentLabel(segment),
            href,
            isLast: index === segments.length - 1,
          };
        });

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex md:items-center md:text-sm">
      <ol className="flex items-center gap-1.5 text-muted-foreground">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />}
            {item.isLast ? (
              <span
                aria-current="page"
                className="max-w-44 truncate font-medium text-foreground"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="max-w-36 truncate transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

