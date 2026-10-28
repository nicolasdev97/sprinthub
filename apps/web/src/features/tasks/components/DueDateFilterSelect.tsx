'use client';

import { useRef, useState } from 'react';
import { Calendar, ChevronDown, Clock, X } from 'lucide-react';

import { Button, Input, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { cn } from '@/shared/utils';

interface DueDateFilterSelectProps {
  value: string; // ISO date 'YYYY-MM-DD' or empty string
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Formats a YYYY-MM-DD string into uppercase DD/MM/YYYY format.
 */
function formatToDDMMYYYY(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return isoDate;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 */
function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns tomorrow's date formatted as YYYY-MM-DD in local time.
 */
function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DueDateFilterSelect({ value, onChange, className }: DueDateFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);
  const [prevValue, setPrevValue] = useState(value);
  const [textInput, setTextInput] = useState(() => formatToDDMMYYYY(value));

  // Sync internal text state with external value when value changes externally (React recommended pattern)
  if (prevValue !== value) {
    setPrevValue(value);
    setTextInput(formatToDDMMYYYY(value));
  }

  const formattedDate = formatToDDMMYYYY(value);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setTextInput('');
    setOpen(false);
  };

  const handleSelectPreset = (dateStr: string) => {
    onChange(dateStr);
    setTextInput(formatToDDMMYYYY(dateStr));
    setOpen(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = '';
    if (raw.length <= 2) {
      formatted = raw;
    } else if (raw.length <= 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    } else {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    }
    setTextInput(formatted);

    if (raw.length === 8) {
      const day = raw.slice(0, 2);
      const month = raw.slice(2, 4);
      const year = raw.slice(4);
      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2000 && y <= 2100) {
        onChange(`${year}-${month}-${day}`);
      }
    } else if (raw.length === 0 && value) {
      onChange('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Filter by due date"
            className={cn(
              'relative flex h-9 w-full appearance-none items-center justify-between rounded-lg border border-input bg-background pl-8 pr-7 py-1 text-sm text-foreground shadow-2xs transition-[color,box-shadow] outline-none hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer dark:bg-input/30',
              value && 'border-primary/50 bg-primary/[0.04] text-primary font-medium',
              className
            )}
          />
        }
      >
        {/* Leading Calendar Icon - Perfectly symmetrical with Select component icons */}
        <Calendar
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground',
            value && 'text-primary'
          )}
        />

        {/* Display Text - Perfectly matching font size and style of standard Selects */}
        <span className="truncate text-sm">{value ? `Due: ${formattedDate}` : 'Due Date'}</span>

        {/* Trailing Icon: Clear X when active, ChevronDown when default */}
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClear(e as unknown as React.MouseEvent);
              }
            }}
            title="Clear due date filter"
            className="absolute right-2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="size-3" />
          </span>
        ) : (
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground"
          />
        )}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 p-3 space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span>Filter by Due Date</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
            DD/MM/YYYY
          </span>
        </div>

        {/* Quick presets */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Quick Presets</span>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectPreset(getTodayString())}
              className={cn(
                'h-7 text-xs justify-start gap-1.5',
                value === getTodayString() && 'border-primary text-primary bg-primary/10'
              )}
            >
              <Clock className="size-3" />
              <span>Today</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectPreset(getTomorrowString())}
              className={cn(
                'h-7 text-xs justify-start gap-1.5',
                value === getTomorrowString() && 'border-primary text-primary bg-primary/10'
              )}
            >
              <Clock className="size-3" />
              <span>Tomorrow</span>
            </Button>
          </div>
        </div>

        {/* Custom date input with explicit uppercase DD/MM/YYYY placeholder */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="due-date-filter-text"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Select Specific Date
            </label>
            {value && (
              <span className="text-[11px] font-semibold text-primary font-mono">
                {formattedDate}
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <Input
              id="due-date-filter-text"
              type="text"
              placeholder="DD/MM/YYYY"
              value={textInput}
              onChange={handleTextChange}
              maxLength={10}
              className="h-8 pl-2.5 pr-8 text-xs font-mono tracking-wide placeholder:font-mono placeholder:text-muted-foreground/60 bg-background"
              aria-label="Filter tasks by exact due date in DD/MM/YYYY format"
            />
            <button
              type="button"
              onClick={() => {
                try {
                  hiddenDateInputRef.current?.showPicker();
                } catch {
                  hiddenDateInputRef.current?.focus();
                }
              }}
              className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Open calendar picker"
            >
              <Calendar className="size-3.5" />
            </button>
            <input
              ref={hiddenDateInputRef}
              type="date"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setTextInput(formatToDDMMYYYY(e.target.value));
              }}
              className="sr-only pointer-events-none absolute opacity-0"
              tabIndex={-1}
            />
          </div>
        </div>

        {/* Action footer */}
        {value && (
          <div className="border-t border-border/60 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange('');
                setTextInput('');
                setOpen(false);
              }}
              className="h-7 w-full text-xs text-muted-foreground hover:text-destructive gap-1"
            >
              <X className="size-3" />
              <span>Clear Date Filter</span>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
