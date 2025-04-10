import { useState, useEffect } from "react";
import MicrophonePermissionGuide from "./MicrophonePermissionGuide";
import TranscriptionArea from "./TranscriptionArea";
import ControlsArea from "./ControlsArea";
import AffirmationCounter from "./AffirmationCounter";
import { DateSelector } from "./DateSelector";
import { ImportExportData } from "./ImportExportData";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { getTodayDateString } from "@/lib/db";
import { Link } from "@/components/ui/link";
import { Info } from "lucide-react";

export default function LiveTranscribe() {
  const [showPermissionGuide, setShowPermissionGuide] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  
  const {
    transcript,
    interimText,
    isRecording,
    isListening,
    hasError,
    errorMessage,
    startRecording,
    stopRecording,
    resetTranscript
  } = useSpeechRecognition({
    onPermissionDenied: () => setShowPermissionGuide(true)
  });

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setShowPermissionGuide(false);
      startRecording();
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

  // Determine if we're in read-only mode (viewing a past date)
  const isReadOnly = selectedDate !== getTodayDateString();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-2">
          <span className="text-blue-600">Mantra</span><span className="text-green-600">Score</span>.com
        </h1>
        <p className="text-slate-500 mb-2">Track your daily affirmations and mindful speech patterns</p>
        <div className="flex justify-center">
          <Link href="/about" className="text-sm text-slate-400 flex items-center hover:text-blue-600">
            <Info className="h-3 w-3 mr-1" />
            About
          </Link>
        </div>
      </header>

      {/* Date selector only */}
      <div className="mb-6">
        <DateSelector onDateChange={handleDateChange} />
      </div>

      {showPermissionGuide && <MicrophonePermissionGuide />}
      
      {hasError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>{errorMessage || 'An error occurred. Please try again.'}</div>
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
        <p>© {new Date().getFullYear()} MantraScore.com | Created by Sean Lavery</p>
        <p className="mt-2">All data is stored locally in your browser. No audio or transcript data is sent to any server.</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link 
            href="https://github.com/TheSeanLavery/mantrascore.com" 
            className="text-xs text-slate-400 hover:text-blue-600"
          >
            GitHub
          </Link>
          <Link 
            href="/license.txt" 
            className="text-xs text-slate-400 hover:text-blue-600"
          >
            MIT License
          </Link>
        </div>
      </footer>
      
      {/* Import/Export controls at the bottom */}
      <div className="mt-8 flex justify-center">
        <ImportExportData />
      </div>
    </div>
  );
}
