'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui';
import { useWorkspaceContext } from '@/features/workspaces';

export default function ActiveWorkspaceSettingsRedirectPage() {
  const router = useRouter();
  const { activeWorkspaceId, isLoading } = useWorkspaceContext();

  useEffect(() => {
    if (isLoading) return;

    if (activeWorkspaceId) {
      router.replace(`/workspaces/${activeWorkspaceId}/settings`);
    } else {
      router.replace('/workspaces');
    }
  }, [activeWorkspaceId, isLoading, router]);

  return (
    <div className="space-y-6" aria-busy="true" aria-label="Redirecting to workspace settings">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
