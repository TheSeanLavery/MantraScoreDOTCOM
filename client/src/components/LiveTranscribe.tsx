import { useState, useEffect } from "react";
import MicrophonePermissionGuide from "./MicrophonePermissionGuide";
import TranscriptionArea from "./TranscriptionArea";
import ControlsArea from "./ControlsArea";
import AffirmationCounter from "./AffirmationCounter";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Toaster } from "@/components/ui/toaster";

export default function LiveTranscribe() {
  const [showPermissionGuide, setShowPermissionGuide] = useState(true);
  
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-2">Affirmation Counter</h1>
        <p className="text-slate-500">Count your positive affirmations and track words to avoid</p>
      </header>

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

      <AffirmationCounter transcript={transcript} />

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

      <footer className="text-center text-sm text-slate-500 mt-8">
        <p>Privacy Note: All transcription happens locally in your browser. No audio data is sent to any server.</p>
      </footer>
      
      {/* Show toast notifications for completed targets */}
      <Toaster />
    </div>
  );
}
