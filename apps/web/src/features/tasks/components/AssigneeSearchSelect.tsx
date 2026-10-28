'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, UserMinus, X } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui';
import { WorkspaceMember } from '@/features/workspaces';
import { cn } from '@/shared/utils';

interface AssigneeSearchSelectProps {
  id?: string;
  value?: string;
  onValueChange: (value: string) => void;
  members: WorkspaceMember[];
  disabled?: boolean;
  className?: string;
}

export function AssigneeSearchSelect({
  id,
  value = '',
  onValueChange,
  members,
  disabled = false,
  className,
}: AssigneeSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedMember = useMemo(
    () => members.find((member) => member.userId === value),
    [members, value]
  );

  const filteredMembers = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return members;
    }

    return members.filter((member) => {
      if (!member.user) {
        return member.userId.toLowerCase().includes(trimmed);
      }
      const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
      const email = member.user.email.toLowerCase();
      return fullName.includes(trimmed) || email.includes(trimmed);
    });
  }, [members, searchQuery]);

  const showUnassignedOption = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    return !trimmed || 'unassigned'.includes(trimmed);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const selectedDisplay = selectedMember?.user
    ? `${selectedMember.user.firstName} ${selectedMember.user.lastName} (${selectedMember.user.email})`
    : selectedMember
      ? selectedMember.userId
      : 'Unassigned';

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-1 text-left text-sm text-foreground shadow-2xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
          isOpen && 'border-ring ring-3 ring-ring/50'
        )}
      >
        <span className="truncate">{selectedDisplay}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Workspace members"
          className="absolute top-full left-0 z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
        >
          {/* Search Input Header */}
          <div className="relative border-b border-border p-2">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              aria-label="Search assignee by name or email"
              className="h-8 w-full rounded-md border border-input bg-background pr-7 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none dark:bg-input/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                title="Clear search"
                className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filtered Options List */}
          <div className="max-h-52 overflow-y-auto p-1">
            {showUnassignedOption && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => handleSelect('')}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                  !value && 'bg-accent/60 font-semibold text-accent-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-muted/50 text-muted-foreground">
                    <UserMinus className="size-3" />
                  </div>
                  <span>Unassigned</span>
                </div>
                {!value && <Check className="size-3.5 shrink-0 text-primary" />}
              </button>
            )}

            {filteredMembers.map((member) => {
              const isSelected = value === member.userId;
              const fullName = member.user
                ? `${member.user.firstName} ${member.user.lastName}`.trim()
                : member.userId;
              const email = member.user?.email ?? '';
              const initials = member.user
                ? `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`.toUpperCase()
                : 'U';

              return (
                <button
                  key={member.userId}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(member.userId)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-accent/60 font-semibold text-accent-foreground'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="size-6 shrink-0 border border-border">
                      <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{fullName}</p>
                      {email && (
                        <p className="truncate text-[11px] text-muted-foreground">{email}</p>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                </button>
              );
            })}

            {!showUnassignedOption && filteredMembers.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                No members matching &ldquo;{searchQuery.trim()}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
