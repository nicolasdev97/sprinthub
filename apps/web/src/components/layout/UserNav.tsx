'use client';

import { useRouter } from 'next/navigation';
import { Keyboard, LogOut, User as UserIcon } from 'lucide-react';

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

interface UserNavProps {
  onOpenShortcuts?: () => void;
}

export function UserNav({ onOpenShortcuts }: UserNavProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      window.sessionStorage.setItem('sprinthub:logout-redirect', '1');
    } catch {
      // Ignore storage write errors
    }
    await logout();
    router.replace('/');
  };

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const email = user.email;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

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
          <DropdownMenuItem onClick={() => onOpenShortcuts?.()} className="cursor-pointer">
            <Keyboard className="size-4 text-muted-foreground" />
            <span>Keyboard Shortcuts</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
            <LogOut className="size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
