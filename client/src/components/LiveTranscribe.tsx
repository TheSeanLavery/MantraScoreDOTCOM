import { useState, useEffect } from "react";
import MicrophonePermissionGuide from "./MicrophonePermissionGuide";
import TranscriptionArea from "./TranscriptionArea";
import ControlsArea from "./ControlsArea";
import AffirmationCounter from "./AffirmationCounter";
import { ImportExportData } from "./ImportExportData";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { getTodayDateString } from "@/lib/db";
import { Link } from "@/components/ui/link";
import { Info, Trash2 } from "lucide-react";
import { NewDateSelector, clearAllAffirmationData } from "./NewDateSelector";
import { Button } from "@/components/ui/button";

export default function LiveTranscribe() {
  // Only show permission guide if microphone access is not granted
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const {
    transcript,
    interimText,
    isRecording,
    isListening,
    hasError,
    errorMessage,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useSpeechRecognition({
    onPermissionDenied: () => setShowPermissionGuide(true),
  });

  // If user successfully starts recording, they must have granted mic access
  useEffect(() => {
    if (isRecording) {
      setShowPermissionGuide(false);
    }
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
      // If starting recording fails due to permissions, the onPermissionDenied callback will show the guide
    }
  };

  // Reset transcript and processed content
  const clearTranscript = () => {
    resetTranscript();
  };

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };
  
  // Clear all data
  const clearAllData = async () => {
    // Ask for confirmation before clearing
    const confirmed = window.confirm(
      "Are you sure you want to clear ALL your affirmation data? This cannot be undone."
    );
    
    if (confirmed) {
      try {
        setIsClearing(true);
        
        // Use the exported function to clear all data
        await clearAllAffirmationData();
        
        // Go back to today
        setSelectedDate(getTodayDateString());
        
        // Show success alert
        alert("All data has been cleared successfully.");
      } catch (error) {
        console.error("Error clearing data:", error);
        alert("Failed to clear data. Please try again.");
      } finally {
        setIsClearing(false);
      }
    }
  };
  
  // Determine if we're in read-only mode (viewing a past date)
  const isReadOnly = selectedDate !== getTodayDateString();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-6 text-center">
        <div className="flex justify-center items-center mb-2">
          <img 
            src="/cropped_glow_icon.png" 
            alt="MantraScore Logo" 
            className="h-12 w-auto mr-3" 
          />
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
            <span className="text-teal-500">Mantra</span>
            <span className="text-amber-400">Score</span>.com
          </h1>
        </div>
        <p className="text-slate-500 mb-2">
          Track your daily affirmations and mindful speech patterns
        </p>
        <div className="flex justify-center">
          <Link
            href="/about"
            className="text-sm text-slate-400 flex items-center hover:text-teal-500"
          >
            <Info className="h-3 w-3 mr-1" />
            About
          </Link>
        </div>
      </header>

      {/* Date selector */}
      <div className="mb-6">
        <NewDateSelector onDateChange={handleDateChange} />
      </div>

      {/* Only show the permission guide if microphone access is not granted */}
      {showPermissionGuide && !isRecording && <MicrophonePermissionGuide />}

      {hasError && !showPermissionGuide && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>{errorMessage || "An error occurred. Please try again."}</div>
          </div>
        </div>
      )}

      <AffirmationCounter
        transcript={transcript}
        selectedDate={selectedDate}
        readOnly={isReadOnly}
      />

      {!isReadOnly && (
        <>
          <TranscriptionArea
            transcript={transcript}
            interimText={interimText}
            isRecording={isRecording}
            isListening={isListening}
            hasError={hasError}
          />

          <ControlsArea
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            clearTranscript={clearTranscript}
          />
        </>
      )}

      <footer className="text-center text-sm text-slate-500 mt-8 border-t pt-8">
        <p>
          © {new Date().getFullYear()} MantraScore.com | Created by Sean Lavery
        </p>
        <p className="mt-2">
          All data is stored locally in your browser. No audio or transcript
          data is sent to any server.
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <Link
            href="https://github.com/TheSeanLavery/MantraScoreDOTCOM"
            className="text-xs text-slate-400 hover:text-teal-500"
          >
            GitHub
          </Link>
          <Link
            href="/license.txt"
            className="text-xs text-slate-400 hover:text-teal-500"
          >
            MIT License
          </Link>
        </div>
      </footer>

      {/* Import/Export controls at the bottom */}
      <div className="mt-8 flex justify-center">
        <ImportExportData />
      </div>
      
      {/* Clear data button */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="destructive"
          size="sm"
          onClick={clearAllData}
          disabled={isClearing}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          <span>{isClearing ? "Clearing..." : "Clear All Data"}</span>
        </Button>
      </div>
    </div>
  );
}
