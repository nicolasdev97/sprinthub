'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Moon, Settings, Sun, User as UserIcon } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useWorkspaceContext } from '@/features/workspaces';

const THEME_STORAGE_KEY = 'sprinthub:theme';

export function UserNav() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeWorkspaceId } = useWorkspaceContext();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const handleToggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    setIsDark(nextIsDark);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light');
    } catch {
      // Ignore storage write errors
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Guest User';
  const email = user?.email ?? 'Not signed in';
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'GU';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring outline-none"
        aria-label="Open user menu"
      >
        <Avatar className="size-8 border border-border">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5 py-0.5">
            <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            <UserIcon className="size-4 text-muted-foreground" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(
                activeWorkspaceId
                  ? `/workspaces/${activeWorkspaceId}/settings`
                  : '/workspaces'
              )
            }
          >
            <Settings className="size-4 text-muted-foreground" />
            <span>Workspace Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleTheme}>
            {isDark ? (
              <>
                <Sun className="size-4 text-muted-foreground" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="size-4 text-muted-foreground" />
                <span>Dark Mode</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {user ? (
            <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => router.push('/login')}>
              <UserIcon className="size-4 text-muted-foreground" />
              <span>Log in</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

