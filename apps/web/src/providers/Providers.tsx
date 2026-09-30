'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query/queryClient';
import { AuthProvider } from '@/features/auth';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthProvider>
  );
}
