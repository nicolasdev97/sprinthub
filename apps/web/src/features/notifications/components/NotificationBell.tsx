'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AtSign,
  Bell,
  BellOff,
  Briefcase,
  Check,
  CheckCheck,
  ClipboardList,
  FolderKanban,
  RefreshCw,
} from 'lucide-react';

import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
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
  const cleanMessage = notification.message.replace(/<!--.*?-->/g, '').toLowerCase();
  const cleanTitle = notification.title.toLowerCase();
  const combined = `${cleanTitle} ${cleanMessage}`;

  // Task notifications (priority, status, assignment) -> Blue ClipboardList
  if (
    cleanTitle.includes('task') ||
    combined.includes('task') ||
    combined.includes('priority') ||
    combined.includes('assign') ||
    combined.includes('status')
  ) {
    return {
      icon: ClipboardList,
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    };
  }

  // Project notifications -> Orange/Amber FolderKanban
  if (cleanTitle.includes('project') || combined.includes('project')) {
    return {
      icon: FolderKanban,
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    };
  }

  // Workspace notifications -> Purple Briefcase
  if (
    cleanTitle.includes('workspace') ||
    combined.includes('workspace') ||
    combined.includes('invite') ||
    combined.includes('member')
  ) {
    return {
      icon: Briefcase,
      className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    };
  }

  // Mention notifications
  if (combined.includes('mention') || combined.includes('@')) {
    return {
      icon: AtSign,
      className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
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
  const { isAuthenticated, isInitializing } = useAuth();
  const { activeWorkspace, setActiveWorkspaceId } = useWorkspaceContext();

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useNotifications({
    enabled: isAuthenticated && !isInitializing,
  });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');

  const unreadNotifications = notifications.filter((item) => !item.isRead);
  const unreadCount = unreadNotifications.length;

  const displayedNotifications =
    filterTab === 'unread' ? unreadNotifications : notifications;
  const visibleNotifications = displayedNotifications.slice(0, 50);

  const handleSingleMarkAsRead = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    if (markAsReadMutation.isPending) return;

    try {
      await markAsReadMutation.mutateAsync(notificationId);
      toast({
        title: 'Marked as read',
        description: 'Notification updated.',
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Failed to update notification',
        description: normalizeApiError(err).message,
        variant: 'destructive',
      });
    }
  };

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

    const linkMatch = notification.message.match(/<!--link:(.*?)-->/);
    if (linkMatch && linkMatch[1]) {
      const targetUrl = linkMatch[1];
      const wsMatch = targetUrl.match(/\/workspaces\/([0-9a-fA-F-]+)/);
      if (wsMatch && wsMatch[1]) {
        setActiveWorkspaceId(wsMatch[1]);
      }
      router.push(targetUrl);
      return;
    }

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

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-88 p-0 sm:w-96 flex flex-col h-[440px] max-h-[85vh] overflow-hidden shadow-lg"
      >
        {/* Header */}
        <div className="flex flex-col border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
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
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <CheckCheck className="size-3.5" />
                <span>Mark all as read</span>
              </Button>
            )}
          </div>

          {/* Filter Tabs: All vs Unread */}
          <div className="flex items-center gap-1.5 px-3 pb-2">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
                filterTab === 'all'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('unread')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
                filterTab === 'unread'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Content Body: 4 UI States */}
        {isLoading ? (
          <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto" aria-busy="true">
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
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-4 py-8 text-center">
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
        ) : displayedNotifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            {filterTab === 'unread' ? (
              <>
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCheck className="size-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">You are all caught up</p>
                <p className="max-w-60 text-xs text-muted-foreground">
                  No unread notifications right now.
                </p>
              </>
            ) : (
              <>
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <BellOff className="size-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">No notifications yet</p>
                <p className="max-w-60 text-xs text-muted-foreground">
                  You will be notified here when tasks are assigned to you or updated.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {visibleNotifications.map((notification) => {
              const { icon: Icon, className: iconTone } =
                getNotificationIcon(notification);

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60',
                    !notification.isRead && 'bg-primary/[0.04]'
                  )}
                >
                  <div
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg cursor-pointer',
                      iconTone
                    )}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div
                    onClick={() => handleNotificationClick(notification)}
                    className="min-w-0 flex-1 space-y-1 cursor-pointer"
                  >
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
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {notification.message.replace(/<!--.*?-->/g, '').trim()}
                    </p>
                  </div>

                  {/* Inline Mark As Read Action Button */}
                  <div className="shrink-0 flex items-center pt-0.5">
                    {!notification.isRead ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleSingleMarkAsRead(e, notification.id)}
                        disabled={markAsReadMutation.isPending}
                        className="size-6 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        title="Mark as read"
                        aria-label="Mark as read"
                      >
                        <Check className="size-3.5" />
                      </Button>
                    ) : (
                      <span className="size-2 invisible" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        {displayedNotifications.length > 0 && (
          <div className="border-t border-border px-4 py-2 text-center text-[11px] text-muted-foreground bg-muted/20 shrink-0">
            Showing {visibleNotifications.length} recent notification{visibleNotifications.length === 1 ? '' : 's'}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
