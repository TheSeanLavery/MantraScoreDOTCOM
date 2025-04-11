import React, { useEffect } from 'react';
import { DatePickerProvider, useDatePicker } from './DatePickerContext';
import { DatePickerInput } from './DatePickerInput';
import { DatePickerCalendar } from './DatePickerCalendar';
import { normalizeDate, safeFormat } from './DatePickerUtils';
import { cn } from '@/lib/utils';

export type DatePickerProps = {
  /** The selected date value */
  value?: Date | null;
  /** Callback when date changes */
  onChange?: (date: Date | null) => void;
  /** Format to display the date, defaults to yyyy-MM-dd */
  dateFormat?: string;
  /** Dates to highlight in the calendar */
  highlightedDates?: Date[];
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Placeholder for the input */
  placeholder?: string;
  /** Disable the datepicker */
  disabled?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Optional ID for the input */
  id?: string;
  /** Optional name for the input */
  name?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Aria label for the input */
  'aria-label'?: string;
  /** Element ID that describes the input */
  'aria-describedby'?: string;
};

export function DatePicker({
  value,
  onChange,
  dateFormat = 'yyyy-MM-dd',
  highlightedDates = [],
  minDate,
  maxDate,
  placeholder,
  disabled,
  className,
  id,
  name,
  required,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: DatePickerProps) {
  // Component state is managed by the DatePickerProvider
  // This component acts as a controlled component wrapper
  
  // Normalize the date value (set time to 00:00:00)
  const normalizedValue = normalizeDate(value);
  
  // Format the current date for debugging and display
  const formattedDate = safeFormat(normalizedValue, dateFormat);
  
  return (
    <DatePickerProvider
      initialDate={normalizedValue}
      highlightedDates={highlightedDates}
      minDate={minDate}
      maxDate={maxDate}
      dateFormat={dateFormat}
    >
      <DatePickerProviderConsumer onChange={onChange}>
        <div className={cn('relative inline-block w-full', className)}>
          <DatePickerInput
            placeholder={placeholder}
            disabled={disabled}
            dateFormat={dateFormat}
            id={id}
            name={name}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
          />
          <DatePickerCalendar className="min-w-[320px]" />
        </div>
      </DatePickerProviderConsumer>
    </DatePickerProvider>
  );
}

// This internal component connects the external onChange prop to the internal state
function DatePickerProviderConsumer({ 
  onChange, 
  children 
}: { 
  onChange?: (date: Date | null) => void;
  children: React.ReactNode;
}) {
  const { state } = useDatePicker();
  
  // Call the onChange handler whenever selectedDate changes
  useEffect(() => {
    if (onChange) {
      onChange(state.selectedDate);
    }
  }, [state.selectedDate, onChange]);
  
  return <>{children}</>;
}

// Navigation components for moving to prev/next day or week
export function DatePickerNavigation({
  onPrevious,
  onNext,
  onToday,
  disabled = false,
  className,
}: {
  onPrevious?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <button
        type="button"
        onClick={onPrevious}
        disabled={disabled}
        className="px-3 py-1 text-sm rounded-md hover:bg-muted disabled:opacity-50"
        aria-label="Previous date"
      >
        Previous
      </button>
      
      {onToday && (
        <button
          type="button"
          onClick={onToday}
          disabled={disabled}
          className="px-3 py-1 text-sm rounded-md hover:bg-muted disabled:opacity-50"
          aria-label="Go to today"
        >
          Today
        </button>
      )}
      
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="px-3 py-1 text-sm rounded-md hover:bg-muted disabled:opacity-50"
        aria-label="Next date"
      >
        Next
      </button>
    </div>
  );
} 