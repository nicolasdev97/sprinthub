'use client';

import * as React from 'react';
import { Calendar, X } from 'lucide-react';

import { cn } from '@/shared/utils';

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string; // Expects ISO date string 'YYYY-MM-DD' or empty string
  onChange?: (value: string) => void;
  placeholder?: string;
}

/**
 * Formats a YYYY-MM-DD string into DD/MM/YYYY.
 */
function toDisplayFormat(isoDate?: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return isoDate;
}

/**
 * Validates DD, MM, YYYY numbers and returns YYYY-MM-DD or empty string.
 */
function toIsoFormat(displayDate: string): string | null {
  const digits = displayDate.replace(/[^0-9]/g, '');
  if (digits.length !== 8) return null;
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2000 && y <= 2100) {
    return `${year}-${month}-${day}`;
  }
  return null;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      value = '',
      onChange,
      placeholder = 'DD/MM/YYYY',
      disabled = false,
      className,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const hiddenDateInputRef = React.useRef<HTMLInputElement>(null);
    const [prevValue, setPrevValue] = React.useState(value);
    const [textValue, setTextValue] = React.useState(() => toDisplayFormat(value));

    // Sync display string if external value changed
    if (prevValue !== value) {
      setPrevValue(value);
      setTextValue(toDisplayFormat(value));
    }

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

      setTextValue(formatted);

      if (raw.length === 8) {
        const iso = toIsoFormat(formatted);
        if (iso) {
          onChange?.(iso);
        }
      } else if (raw.length === 0 && value) {
        onChange?.('');
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setTextValue('');
      onChange?.('');
    };

    const handleOpenPicker = () => {
      if (disabled) return;
      try {
        hiddenDateInputRef.current?.showPicker();
      } catch {
        hiddenDateInputRef.current?.focus();
      }
    };

    return (
      <div className={cn('relative flex items-center', className)}>
        <input
          ref={ref}
          id={id}
          name={name}
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={textValue}
          onChange={handleTextChange}
          maxLength={10}
          className={cn(
            'flex h-9 w-full min-w-0 rounded-lg border border-input bg-transparent pl-3 pr-16 py-1 text-sm font-mono tracking-wide text-foreground shadow-2xs transition-[color,box-shadow] outline-none placeholder:font-mono placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30'
          )}
          {...props}
        />

        <div className="absolute right-2 flex items-center gap-1 text-muted-foreground">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear date"
              className="rounded p-0.5 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={handleOpenPicker}
            title="Open calendar picker"
            className="rounded p-0.5 hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <Calendar className="size-4" />
          </button>
        </div>

        {/* Hidden native input for invoking system date picker */}
        <input
          ref={hiddenDateInputRef}
          type="date"
          tabIndex={-1}
          disabled={disabled}
          value={value}
          onChange={(e) => {
            const nextVal = e.target.value;
            onChange?.(nextVal);
            setTextValue(toDisplayFormat(nextVal));
          }}
          className="sr-only pointer-events-none absolute opacity-0"
        />
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

