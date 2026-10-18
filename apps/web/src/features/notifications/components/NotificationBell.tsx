'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AtSign,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  UserPlus,
} from 'lucide-react';

import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Separator,
  Skeleton,
  useToast,
} from '@/components/ui';
import { useWorkspaceContext } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';
import { cn } from '@/shared/utils';

import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from '../hook';
import { Notification } from '../types';

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (Number.isNaN(diffSeconds) || diffSeconds < 45) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getNotificationIcon(notification: Notification) {
  const combined = `${notification.title} ${notification.message}`.toLowerCase();

  if (combined.includes('assign')) {
    return {
      icon: ClipboardList,
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    };
  }

  if (combined.includes('mention') || combined.includes('@')) {
    return {
      icon: AtSign,
      className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    };
  }

  if (
    combined.includes('status') ||
    combined.includes('completed') ||
    combined.includes('done')
  ) {
    return {
      icon: CheckCircle2,
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    };
  }

  if (combined.includes('invite') || combined.includes('workspace') || combined.includes('member')) {
    return {
      icon: UserPlus,
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    };
  }

  return {
    icon: Bell,
    className: 'bg-primary/10 text-primary',
  };
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { activeWorkspace } = useWorkspaceContext();

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useNotifications();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const unreadNotifications = notifications.filter((item) => !item.isRead);
  const unreadCount = unreadNotifications.length;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead && !markAsReadMutation.isPending) {
      try {
        await markAsReadMutation.mutateAsync(notification.id);
      } catch (err) {
        toast({
          title: 'Failed to update notification',
          description: normalizeApiError(err).message,
          variant: 'destructive',
        });
      }
    }

    setIsOpen(false);

    const combined = `${notification.title} ${notification.message}`.toLowerCase();
    if (combined.includes('task') || combined.includes('assign') || combined.includes('status')) {
      router.push('/tasks');
      return;
    }

    if (combined.includes('project')) {
      router.push(
        activeWorkspace ? `/workspaces/${activeWorkspace.id}/projects` : '/projects'
      );
      return;
    }

    router.push(
      activeWorkspace ? `/workspaces/${activeWorkspace.id}/dashboard` : '/dashboard'
    );
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markAllAsReadMutation.isPending) {
      return;
    }

    try {
      await markAllAsReadMutation.mutateAsync(
        unreadNotifications.map((item) => item.id)
      );
      toast({
        title: 'All caught up',
        description: 'All notifications have been marked as read.',
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Could not mark notifications as read',
        description: normalizeApiError(err).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={
              unreadCount > 0
                ? `Notifications (${unreadCount} unread)`
                : 'Notifications'
            }
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-2xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-88 p-0 sm:w-96">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                {unreadCount} new
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="size-3.5" />
              <span>Mark all as read</span>
            </Button>
          )}
        </div>

        <Separator />

        {/* Content Body: 4 UI States */}
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2.5 px-4 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Unable to load notifications
              </p>
              <p className="text-xs text-muted-foreground">
                {normalizeApiError(error).message}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-1 gap-1.5"
            >
              <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />
              <span>Retry</span>
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BellOff className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="max-w-60 text-xs text-muted-foreground">
              You will be notified here when tasks are assigned to you or updated.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96 divide-y divide-border">
            {notifications.map((notification) => {
              const { icon: Icon, className: iconTone } =
                getNotificationIcon(notification);

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none',
                    !notification.isRead && 'bg-primary/[0.04]'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                      iconTone
                    )}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          'line-clamp-1 text-xs',
                          notification.isRead
                            ? 'font-medium text-foreground/85'
                            : 'font-semibold text-foreground'
                        )}
                      >
                        {notification.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <span
                      aria-label="Unread notification"
                      className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
