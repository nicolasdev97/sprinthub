'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth';

interface RealtimeEventsProviderProps {
  children: ReactNode;
}

export function RealtimeEventsProvider({ children }: RealtimeEventsProviderProps) {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || typeof window === 'undefined') {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const sseUrl = `${apiUrl}/events?token=${encodeURIComponent(accessToken)}`;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;

      try {
        eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          if (!event.data) return;
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'TASK_MUTATED':
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                break;
              case 'PROJECT_MUTATED':
                queryClient.invalidateQueries({ queryKey: ['projects'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                break;
              case 'WORKSPACE_MUTATED':
                queryClient.invalidateQueries({ queryKey: ['workspaces'] });
                queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                break;
              case 'NOTIFICATION_CREATED':
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                break;
              default:
                break;
            }
          } catch {
            // Heartbeats or non-JSON messages can be safely ignored
          }
        };

        eventSource.onerror = () => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          if (!isDisposed) {
            reconnectTimeout = setTimeout(connect, 5000);
          }
        };
      } catch {
        if (!isDisposed) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [accessToken, isAuthenticated, queryClient]);

  return <>{children}</>;
}

