import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { affirmationDB, getTodayDateString } from '@/lib/db';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  onDateChange: (date: string) => void;
}

// Export the clearAllData function so it can be used elsewhere
export async function clearAllAffirmationData(): Promise<void> {
  // Get all records so we can delete them one by one
  const records = await affirmationDB.getAllRecords();
  
  // Delete each record
  for (const record of records) {
    await affirmationDB.deleteRecord(record.date);
  }
}

export function NewDateSelector({ onDateChange }: DateSelectorProps) {
  // State for managing the selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State for tracking available dates with data
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  
  // State to track if data is loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load available dates from database
  const loadDates = async () => {
    try {
      setIsLoading(true);
      
      // Get all records from the database
      const records = await affirmationDB.getAllRecords();
      
      // Extract dates from records and convert to Date objects
      const dates = records
        .map(record => {
          try {
            // Parse the date string to a Date object
            const [year, month, day] = record.date.split('-').map(Number);
            return new Date(year, month - 1, day);
          } catch (error) {
            console.error("Error parsing date:", record.date, error);
            return null;
          }
        })
        .filter((date): date is Date => date !== null)
        // Sort dates in descending order (newest first)
        .sort((a, b) => b.getTime() - a.getTime());
      
      setAvailableDates(dates);
    } catch (error) {
      console.error("Error loading dates:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadDates();
  }, []);
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    // Find the previous date with data
    const prevDate = availableDates.find(date => date < selectedDate);
    
    if (prevDate) {
      setSelectedDate(prevDate);
      onDateChange(format(prevDate, 'yyyy-MM-dd'));
    }
  };
  
  // Navigate to next day
  const goToNextDay = () => {
    // Find the next date with data
    const nextDate = [...availableDates]
      .reverse()
      .find(date => date > selectedDate);
    
    if (nextDate) {
      setSelectedDate(nextDate);
      onDateChange(format(nextDate, 'yyyy-MM-dd'));
    } else {
      // If no next date with data, go to today
      goToToday();
    }
  };
  
  // Go to today
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onDateChange(format(today, 'yyyy-MM-dd'));
  };
  
  // Check if we can go to previous/next days
  const hasPreviousDay = availableDates.some(date => date < selectedDate);
  const hasNextDay = availableDates.some(date => date > selectedDate);
  
  // Today's date for comparison
  const today = new Date();
  const isSelectedToday = isSameDay(selectedDate, today);
  
  // Check if today is the newest date with data
  const isTodayNewestDate = availableDates.length > 0 && 
    !availableDates.some(date => date > today);
  
  // Format selected date for display
  const formattedDate = format(selectedDate, 'MMMM d, yyyy');
  
  return (
    <div className="space-y-6">
      {/* Date navigation controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToPreviousDay}
          disabled={isLoading || !hasPreviousDay}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>
        
        <div className="text-center font-medium">
          {formattedDate}
          {isSelectedToday && <span className="ml-2 text-teal-500">(Today)</span>}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToNextDay}
          disabled={isLoading || !hasNextDay || (isSelectedToday && isTodayNewestDate)}
          className="flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {isLoading && (
        <div className="text-center text-sm text-muted-foreground">
          Loading date data...
        </div>
      )}
    </div>
  );
} 