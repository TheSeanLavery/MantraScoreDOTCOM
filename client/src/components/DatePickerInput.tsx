import React, { useRef, useState, KeyboardEvent, FocusEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon } from 'lucide-react';
import { useDatePicker } from './DatePickerContext';
import { isValidDateString, safeFormat } from './DatePickerUtils';
import { cn } from '@/lib/utils';

interface DatePickerInputProps {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  dateFormat?: string;
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function DatePickerInput({
  placeholder = 'Select date...',
  disabled = false,
  className,
  onFocus,
  onBlur,
  dateFormat = 'yyyy-MM-dd',
  id,
  name,
  required,
  'aria-label': ariaLabel = 'Date',
  'aria-describedby': ariaDescribedBy,
}: DatePickerInputProps) {
  const { state, dispatch, formatDate, parseDate } = useDatePicker();
  const { selectedDate, isOpen, isLoading, error } = state;
  
  // Local state for input value
  const [inputValue, setInputValue] = useState<string>(formatDate(selectedDate));
  const [focused, setFocused] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update local input value when selected date changes
  React.useEffect(() => {
    setInputValue(formatDate(selectedDate));
  }, [selectedDate, formatDate]);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // If input is empty, clear the selected date
    if (!value.trim()) {
      dispatch({ type: 'SELECT_DATE', date: null });
      return;
    }
    
    // Don't update selection while typing unless it's a valid date
    if (isValidDateString(value, dateFormat)) {
      const date = parseDate(value);
      if (date) {
        dispatch({ type: 'SELECT_DATE', date });
      }
    }
  };
  
  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    
    // Reset input to match selected date on blur
    setInputValue(formatDate(selectedDate));
    
    if (onBlur) onBlur();
  };
  
  const handleInputFocus = () => {
    setFocused(true);
    if (onFocus) onFocus();
  };
  
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle keyboard navigation
    switch (e.key) {
      case 'Enter':
        // Try to parse and select the current input value
        if (isValidDateString(inputValue, dateFormat)) {
          const date = parseDate(inputValue);
          if (date) {
            dispatch({ type: 'SELECT_DATE', date });
          }
        } 
        // Toggle calendar if Enter when input is focused
        dispatch({ type: 'TOGGLE_CALENDAR' });
        break;
        
      case 'Escape':
        // Close calendar if open
        if (isOpen) {
          dispatch({ type: 'TOGGLE_CALENDAR', isOpen: false });
          e.preventDefault();
        }
        break;
        
      case 'ArrowDown':
        if (!isOpen) {
          // Open calendar with down arrow
          dispatch({ type: 'TOGGLE_CALENDAR', isOpen: true });
          e.preventDefault();
        }
        break;
        
      default:
        break;
    }
  };
  
  const toggleCalendar = () => {
    if (!disabled) {
      dispatch({ type: 'TOGGLE_CALENDAR' });
      if (!isOpen) {
        // Focus the input when opening the calendar
        inputRef.current?.focus();
      }
    }
  };
  
  return (
    <div className={cn('relative flex items-center', className)}>
      <Input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        required={required}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className={cn(
          'pr-10',
          error && 'border-red-500 focus-visible:ring-red-500',
          focused && 'ring-2 ring-offset-2 ring-offset-background'
        )}
        aria-invalid={!!error}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        autoComplete="off"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 h-full px-3 py-0"
        disabled={disabled || isLoading}
        onClick={toggleCalendar}
        aria-label="Toggle calendar"
        aria-expanded={isOpen}
        aria-controls={isOpen ? "date-picker-calendar" : undefined}
      >
        <CalendarIcon className="h-4 w-4" />
      </Button>
      
      {error && (
        <div 
          className="text-red-500 text-sm mt-1" 
          id={ariaDescribedBy}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
} 