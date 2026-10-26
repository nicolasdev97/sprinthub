'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { ToastProvider } from '@/components/ui';
import { AuthProvider } from '@/features/auth';
import { queryClient } from '@/lib';

import { ThemeProvider } from './ThemeProvider';
import { RealtimeEventsProvider } from './RealtimeEventsProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RealtimeEventsProvider>
            <ToastProvider>{children}</ToastProvider>
          </RealtimeEventsProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
