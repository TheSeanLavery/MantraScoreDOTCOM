import React, { useEffect, useRef } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useDatePicker } from './DatePickerContext';
import { isDateIncluded, getDateDescription } from './DatePickerUtils';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';
import { SelectSingleEventHandler, DayProps } from 'react-day-picker';

interface DatePickerCalendarProps {
  className?: string;
}

export function DatePickerCalendar({ className }: DatePickerCalendarProps) {
  const { state, dispatch, isDateDisabled } = useDatePicker();
  const { selectedDate, isOpen, highlightedDates, minDate, maxDate, isLoading } = state;
  
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Focus the calendar when it opens
  useEffect(() => {
    if (isOpen && calendarRef.current) {
      // Use setTimeout to ensure the calendar is rendered before focusing
      setTimeout(() => {
        const focusableElement = calendarRef.current?.querySelector('button:not([disabled])') as HTMLElement;
        focusableElement?.focus();
      }, 10);
    }
  }, [isOpen]);
  
  const handleSelect: SelectSingleEventHandler = (day) => {
    if (day) {
      dispatch({ type: 'SELECT_DATE', date: day });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      dispatch({ type: 'TOGGLE_CALENDAR', isOpen: false });
      e.preventDefault();
    }
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div 
      ref={calendarRef}
      className={cn(
        'absolute z-50 mt-1 rounded-md border bg-background shadow-md',
        className
      )}
      onKeyDown={handleKeyDown}
      id="date-picker-calendar"
      role="dialog"
      aria-modal="true"
      aria-label="Date picker calendar"
    >
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={handleSelect}
        disabled={(date) => isDateDisabled(date) || isLoading}
        defaultMonth={selectedDate || undefined}
        initialFocus={true}
        modifiers={{
          highlighted: (date) => highlightedDates.some(d => isSameDay(d, date)),
        }}
        modifiersClassNames={{
          highlighted: 'bg-primary/20 font-semibold',
        }}
        // Use a custom day renderer to add more aria attributes
        components={{
          Day: (props: DayProps) => {
            const { date } = props;
            if (!date) return null;
            
            // Get accessibility description
            const dateDescription = getDateDescription(date);
            
            // Check if this day has data
            const hasData = isDateIncluded(date, highlightedDates);
            
            // Enhanced aria description
            const ariaDescription = hasData 
              ? `${dateDescription}. This date has data.` 
              : dateDescription;
            
            // Create a clean div without any non-DOM props
            return (
              <div 
                className={cn(
                  'aria-selected:bg-primary aria-selected:text-primary-foreground',
                  'hover:bg-muted focus:bg-muted',
                  'h-9 w-9 p-0 font-normal',
                  'flex items-center justify-center rounded-md',
                )}
                aria-label={ariaDescription}
                tabIndex={-1}
              >
                {date.getDate()}
              </div>
            );
          }
        }}
      />
    </div>
  );
} 