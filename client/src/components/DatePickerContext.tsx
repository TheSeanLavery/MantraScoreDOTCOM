import React, { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import { format, parse, isValid, startOfDay } from 'date-fns';

// Define types for the context
export type DatePickerState = {
  selectedDate: Date | null;
  isOpen: boolean;
  highlightedDates: Date[];
  minDate?: Date;
  maxDate?: Date;
  isLoading: boolean;
  error: string | null;
};

type DatePickerAction =
  | { type: 'SELECT_DATE'; date: Date | null }
  | { type: 'TOGGLE_CALENDAR'; isOpen?: boolean }
  | { type: 'SET_HIGHLIGHTED_DATES'; dates: Date[] }
  | { type: 'SET_DATE_RANGE'; minDate?: Date; maxDate?: Date }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

type DatePickerContextType = {
  state: DatePickerState;
  dispatch: React.Dispatch<DatePickerAction>;
  // Derived state and helper functions
  formattedDate: string;
  isDateDisabled: (date: Date) => boolean;
  formatDate: (date: Date | null) => string;
  parseDate: (dateString: string) => Date | null;
};

const initialState: DatePickerState = {
  selectedDate: new Date(),
  isOpen: false,
  highlightedDates: [],
  isLoading: false,
  error: null,
};

// Create the context
const DatePickerContext = createContext<DatePickerContextType | undefined>(undefined);

// Reducer for handling state updates
function datePickerReducer(state: DatePickerState, action: DatePickerAction): DatePickerState {
  switch (action.type) {
    case 'SELECT_DATE':
      return {
        ...state,
        selectedDate: action.date ? startOfDay(action.date) : null,
        isOpen: false,
      };
    case 'TOGGLE_CALENDAR':
      return {
        ...state,
        isOpen: action.isOpen !== undefined ? action.isOpen : !state.isOpen,
      };
    case 'SET_HIGHLIGHTED_DATES':
      return {
        ...state,
        highlightedDates: action.dates.map(date => startOfDay(date)),
      };
    case 'SET_DATE_RANGE':
      return {
        ...state,
        minDate: action.minDate,
        maxDate: action.maxDate,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
}

// Props for the provider component
type DatePickerProviderProps = {
  children: ReactNode;
  initialDate?: Date | null;
  highlightedDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
};

// Provider component
export function DatePickerProvider({
  children,
  initialDate = new Date(),
  highlightedDates = [],
  minDate,
  maxDate,
  dateFormat = 'yyyy-MM-dd',
}: DatePickerProviderProps) {
  const [state, dispatch] = useReducer(datePickerReducer, {
    ...initialState,
    selectedDate: initialDate ? startOfDay(initialDate) : null,
    highlightedDates: highlightedDates.map(date => startOfDay(date)),
    minDate,
    maxDate,
  });

  // Memoize derived state and helper functions
  const contextValue = useMemo(() => {
    // Format a date to string using the specified format
    const formatDate = (date: Date | null): string => {
      if (!date || !isValid(date)) return '';
      return format(date, dateFormat);
    };

    // Parse a date string to a Date object
    const parseDate = (dateString: string): Date | null => {
      if (!dateString) return null;
      
      try {
        const parsedDate = parse(dateString, dateFormat, new Date());
        return isValid(parsedDate) ? startOfDay(parsedDate) : null;
      } catch (error) {
        return null;
      }
    };

    // Check if a date is disabled (outside the allowed range)
    const isDateDisabled = (date: Date): boolean => {
      const day = startOfDay(date);
      
      if (state.minDate && day < startOfDay(state.minDate)) {
        return true;
      }
      
      if (state.maxDate && day > startOfDay(state.maxDate)) {
        return true;
      }
      
      return false;
    };

    return {
      state,
      dispatch,
      formattedDate: formatDate(state.selectedDate),
      isDateDisabled,
      formatDate,
      parseDate,
    };
  }, [state, dateFormat]);

  return (
    <DatePickerContext.Provider value={contextValue}>
      {children}
    </DatePickerContext.Provider>
  );
}

// Custom hook for using the context
export function useDatePicker() {
  const context = useContext(DatePickerContext);
  
  if (context === undefined) {
    throw new Error('useDatePicker must be used within a DatePickerProvider');
  }
  
  return context;
} 