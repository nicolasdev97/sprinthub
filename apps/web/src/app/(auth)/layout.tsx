'use client';

import { ReactNode, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui';
import { DEFAULT_AUTHENTICATED_REDIRECT, getSafeRedirectPath, useAuth } from '@/features/auth';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      const searchParams =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const redirectParam = searchParams?.get('redirect');
      const targetPath = getSafeRedirectPath(redirectParam, DEFAULT_AUTHENTICATED_REDIRECT);
      router.replace(targetPath);
    }
  }, [isInitializing, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-muted/30 px-4 py-8 text-foreground">
      {/* Brand Header */}
      <header className="flex w-full max-w-md items-center justify-center pt-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg p-1 font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <span className="text-lg font-bold tracking-tight">SprintHub</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              Workspace &amp; Project Management
            </span>
          </div>
        </Link>
      </header>

      {/* Main Centered Auth Card Area */}
      <main className="my-8 flex w-full flex-1 items-center justify-center">
        {isInitializing ? (
          <div
            className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs"
            aria-busy="true"
            aria-label="Loading authentication"
          >
            <div className="space-y-2 text-center">
              <Skeleton className="mx-auto h-7 w-40" />
              <Skeleton className="mx-auto h-4 w-64" />
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="pb-2 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SprintHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
