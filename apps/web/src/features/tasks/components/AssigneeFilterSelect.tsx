'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, User, UserPlus, Users, UserX, X } from 'lucide-react';

import { Avatar, AvatarFallback, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { cn } from '@/shared/utils';

export interface AssigneeOptionItem {
  id: string;
  name: string;
  email?: string;
  initials: string;
}

interface RawMemberItem {
  userId?: string;
  id?: string;
  user?: {
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface AssigneeFilterSelectProps {
  value: string; // 'ALL' | 'ASSIGNED_TO_ME' | 'CREATED_BY_ME' | 'UNASSIGNED' | userId
  onChange: (value: string) => void;
  members: RawMemberItem[];
  allowCreatedByMe?: boolean;
  allLabel?: string;
  membersTitle?: string;
  className?: string;
}

export function AssigneeFilterSelect({
  value,
  onChange,
  members,
  allowCreatedByMe = false,
  allLabel = 'All Tasks',
  membersTitle = 'Project Members',
  className,
}: AssigneeFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize members into a clean, unique list
  const normalizedMembers = useMemo<AssigneeOptionItem[]>(() => {
    const map = new Map<string, AssigneeOptionItem>();

    members.forEach((m) => {
      const id = m.user?.id || m.userId || m.id;
      if (!id || map.has(id)) return;

      const firstName = m.user?.firstName || m.firstName || '';
      const lastName = m.user?.lastName || m.lastName || '';
      const name = `${firstName} ${lastName}`.trim() || id;
      const initials =
        firstName && lastName
          ? `${firstName[0]}${lastName[0]}`.toUpperCase()
          : name.slice(0, 2).toUpperCase();
      const email = m.user?.email || m.email || '';

      map.set(id, { id, name, email, initials });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return normalizedMembers;
    const q = searchQuery.toLowerCase().trim();
    return normalizedMembers.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.email && m.email.toLowerCase().includes(q))
    );
  }, [normalizedMembers, searchQuery]);

  // Resolve current selection label & icon
  const currentMember = normalizedMembers.find((m) => m.id === value);

  const renderTriggerContent = () => {
    if (value === 'ASSIGNED_TO_ME') {
      return (
        <>
          <User className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">Assigned to me</span>
        </>
      );
    }

    if (value === 'CREATED_BY_ME') {
      return (
        <>
          <UserPlus className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">Created by me</span>
        </>
      );
    }

    if (value === 'UNASSIGNED') {
      return (
        <>
          <UserX className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">Unassigned</span>
        </>
      );
    }

    if (value === 'ALL') {
      return (
        <>
          <Users className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{allLabel}</span>
        </>
      );
    }

    if (currentMember) {
      return (
        <>
          <Avatar className="size-4 shrink-0 text-[9px]">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {currentMember.initials}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{currentMember.name}</span>
        </>
      );
    }

    return (
      <>
        <Users className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{allLabel}</span>
      </>
    );
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setSearchQuery('');
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Filter by assigned user"
            className={cn(
              'flex h-9 w-full appearance-none items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground shadow-2xs transition-[color,box-shadow] outline-none hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer dark:bg-input/30',
              className
            )}
          />
        }
      >
        <div className="flex min-w-0 items-center gap-2">{renderTriggerContent()}</div>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-2 shadow-md">
        {/* Search Input */}
        <div className="flex items-center gap-2 rounded-md border border-input bg-muted/20 px-2 py-1.5 focus-within:border-primary/50">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Quick Options (Always visible or matches search) */}
        <div className="mt-2 space-y-0.5">
          {/* 1. All Tasks */}
          <button
            type="button"
            onClick={() => handleSelect('ALL')}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/50 cursor-pointer',
              value === 'ALL' && 'bg-primary/10 font-semibold text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="size-3.5 text-muted-foreground" />
              <span>{allLabel}</span>
            </div>
            {value === 'ALL' && <Check className="size-3.5 text-primary" />}
          </button>

          {/* 2. Assigned to me */}
          <button
            type="button"
            onClick={() => handleSelect('ASSIGNED_TO_ME')}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/50 cursor-pointer',
              value === 'ASSIGNED_TO_ME' && 'bg-primary/10 font-semibold text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <User className="size-3.5 text-muted-foreground" />
              <span>Assigned to me</span>
            </div>
            {value === 'ASSIGNED_TO_ME' && <Check className="size-3.5 text-primary" />}
          </button>

          {/* 3. Created by me */}
          {allowCreatedByMe && (
            <button
              type="button"
              onClick={() => handleSelect('CREATED_BY_ME')}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/50 cursor-pointer',
                value === 'CREATED_BY_ME' && 'bg-primary/10 font-semibold text-primary'
              )}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="size-3.5 text-muted-foreground" />
                <span>Created by me</span>
              </div>
              {value === 'CREATED_BY_ME' && <Check className="size-3.5 text-primary" />}
            </button>
          )}

          {/* 4. Unassigned */}
          <button
            type="button"
            onClick={() => handleSelect('UNASSIGNED')}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/50 cursor-pointer',
              value === 'UNASSIGNED' && 'bg-primary/10 font-semibold text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <UserX className="size-3.5 text-muted-foreground" />
              <span>Unassigned</span>
            </div>
            {value === 'UNASSIGNED' && <Check className="size-3.5 text-primary" />}
          </button>
        </div>

        {/* Separator & Team Members header */}
        <div className="my-1.5 border-t border-border/50" />
        <div className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {membersTitle} ({filteredMembers.length})
        </div>

        {/* Members List */}
        <div className="mt-1 max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
          {filteredMembers.length === 0 ? (
            <div className="px-2 py-3 text-center text-xs text-muted-foreground">
              No members found
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = value === member.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleSelect(member.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/50 cursor-pointer',
                    isSelected && 'bg-primary/10 font-semibold text-primary'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="size-5 shrink-0 text-[9px]">
                      <AvatarFallback className="bg-primary/10 font-medium text-primary">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-xs leading-snug">{member.name}</p>
                      {member.email && (
                        <p className="truncate text-[10px] text-muted-foreground">{member.email}</p>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
