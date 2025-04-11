import {
  format,
  parse,
  isValid,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  parseISO,
  addDays,
  addMonths,
  addYears,
  setMonth,
  setYear,
} from 'date-fns';

/**
 * Normalizes a date by setting the time to 00:00:00
 */
export function normalizeDate(date: Date | null | undefined): Date | null {
  if (!date) return null;
  return startOfDay(date);
}

/**
 * Checks if a date string is valid according to the given format
 */
export function isValidDateString(dateString: string, formatString: string = 'yyyy-MM-dd'): boolean {
  if (!dateString) return false;
  
  try {
    const parsedDate = parse(dateString, formatString, new Date());
    return isValid(parsedDate);
  } catch {
    return false;
  }
}

/**
 * Safely parses an ISO date string to a Date object
 */
export function safeParseISO(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? parsedDate : null;
  } catch {
    return null;
  }
}

/**
 * Safely formats a date using the provided format string
 * Returns a fallback string if the date is invalid
 */
export function safeFormat(date: Date | null | undefined, formatString: string = 'yyyy-MM-dd', fallback: string = ''): string {
  if (!date || !isValid(date)) return fallback;
  return format(date, formatString);
}

/**
 * Determines if a date is within a valid range
 */
export function isDateInRange(date: Date, minDate?: Date | null, maxDate?: Date | null): boolean {
  const day = startOfDay(date);
  
  if (minDate && isBefore(day, startOfDay(minDate))) {
    return false;
  }
  
  if (maxDate && isAfter(day, endOfDay(maxDate))) {
    return false;
  }
  
  return true;
}

/**
 * Checks if a date is included in an array of dates
 */
export function isDateIncluded(date: Date, dates: Date[]): boolean {
  return dates.some(d => isSameDay(d, date));
}

/**
 * Generate an array of accessible keyboard navigation messages
 */
export function getKeyboardNavigationInstructions(): string[] {
  return [
    'Use arrow keys to navigate dates',
    'Press Enter to select the highlighted date',
    'Press Escape to close the calendar',
    'Press Home to go to the first day of the month',
    'Press End to go to the last day of the month',
    'Press Page Up to go to the previous month',
    'Press Page Down to go to the next month',
  ];
}

/**
 * Gets a human-readable date description for accessibility
 */
export function getDateDescription(date: Date): string {
  const formatted = format(date, 'EEEE, MMMM do, yyyy');
  const todayStr = isToday(date) ? ' (today)' : '';
  return `${formatted}${todayStr}`;
}

/**
 * Converts a native input date to a Date object with validation
 */
export function parseNativeInputDate(value: string): Date | null {
  // Native inputs typically use yyyy-MM-dd format
  return safeParseISO(value);
}

/**
 * Date navigation functions
 */
export const dateNavigationFns = {
  nextDay: (date: Date) => addDays(date, 1),
  prevDay: (date: Date) => addDays(date, -1),
  nextWeek: (date: Date) => addDays(date, 7),
  prevWeek: (date: Date) => addDays(date, -7),
  nextMonth: (date: Date) => addMonths(date, 1),
  prevMonth: (date: Date) => addMonths(date, -1),
  nextYear: (date: Date) => addYears(date, 1),
  prevYear: (date: Date) => addYears(date, -1),
  setMonth: (date: Date, month: number) => setMonth(date, month),
  setYear: (date: Date, year: number) => setYear(date, year),
}; 