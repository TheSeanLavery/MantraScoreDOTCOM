import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { getTodayDateString, formatDateForDisplay, affirmationDB, DailyRecord } from "@/lib/db";

interface DateSelectorProps {
  onDateChange: (date: string) => void;
}

export function DateSelector({ onDateChange }: DateSelectorProps) {
  // Initially set to today, but will update to most recent date after data loads
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [showCalendar, setShowCalendar] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  // Load available dates from the database
  useEffect(() => {
    const loadDates = async () => {
      try {
        console.log("Loading dates from database...");
        const records = await affirmationDB.getAllRecords();
        console.log("Raw records:", records);
        
        // Sort dates in descending order (newest first)
        const dates = records
          .map(record => record.date)
          .sort((a, b) => b.localeCompare(a)); // Reverse sort to get newest first
          
        console.log("Sorted dates (newest first):", dates);
        setAvailableDates(dates);
        
        // If we have dates and today isn't in our dataset, select the most recent one
        if (dates.length > 0) {
          const todayString = getTodayDateString();
          console.log("Today's date:", todayString);
          const todayExists = dates.includes(todayString);
          console.log("Today exists in dates:", todayExists);
          
          // If today's date exists in our records, use it
          // Otherwise use the most recent date (which is the first one after sorting)
          const mostRecentDate = todayExists ? todayString : dates[0];
          console.log("Setting selected date to:", mostRecentDate);
          setSelectedDate(mostRecentDate);
          
          // Immediately notify parent of the change
          onDateChange(mostRecentDate);
        }
      } catch (error) {
        console.error("Error loading dates:", error);
      }
    };
    
    loadDates();
  }, [onDateChange]);
  
  // Navigate to the previous day with data
  const goToPreviousDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };
  
  // Navigate to the next day with data
  const goToNextDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };
  
  // Go to today
  const goToToday = () => {
    setSelectedDate(getTodayDateString());
  };
  
  // Format a date in YYYY-MM-DD format from year, month, day
  const formatDateString = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  // Generate a simple month calendar
  const renderCalendar = () => {
    if (!showCalendar) return null;
    
    const today = new Date(selectedDate);
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Create array for days in month
    const daysInMonth = lastDay.getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const startingDayOfWeek = firstDay.getDay();
    
    // Convert availableDates to a Set for faster lookups
    const availableDatesSet = new Set(availableDates);
    
    return (
      <Card className="p-4 absolute top-full mt-2 bg-white z-10 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const newDate = new Date(year, month - 1, 1);
              setSelectedDate(formatDateString(newDate.getFullYear(), newDate.getMonth(), 1));
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium">
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const newDate = new Date(year, month + 1, 1);
              setSelectedDate(formatDateString(newDate.getFullYear(), newDate.getMonth(), 1));
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Empty spaces for days before the first of the month */}
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {/* Days of the month */}
          {days.map(day => {
            const dateString = formatDateString(year, month, day);
            const isSelected = dateString === selectedDate;
            const hasData = availableDatesSet.has(dateString);
            const isToday = dateString === getTodayDateString();
            
            return (
              <Button
                key={day}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className={`
                  h-8 w-8 p-0 text-xs
                  ${hasData ? 'font-bold' : 'text-gray-500'}
                  ${isToday ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => {
                  setSelectedDate(dateString);
                  setShowCalendar(false);
                }}
              >
                {day}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={goToToday}
          >
            Today
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowCalendar(false)}
          >
            Close
          </Button>
        </div>
      </Card>
    );
  };
  
  return (
    <div className="mb-6 flex items-center justify-between relative">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={goToPreviousDay}
        disabled={availableDates.indexOf(selectedDate) >= availableDates.length - 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Previous Day
      </Button>
      
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="font-medium"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          {formatDateForDisplay(selectedDate)}
        </Button>
        {renderCalendar()}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={goToNextDay}
        disabled={availableDates.indexOf(selectedDate) <= 0}
      >
        Next Day <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
} 