import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  onPermissionDenied?: () => void;
  lang?: string;
}

interface SpeechRecognitionHook {
  transcript: string;
  isRecording: boolean;
  hasError: boolean;
  errorMessage: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  supported: boolean;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const { onPermissionDenied, lang = 'en-US' } = options;

  // Initialize speech recognition
  useEffect(() => {
    // Check if the browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
      setHasError(true);
      setErrorMessage('Speech recognition is not supported in this browser. Try Chrome or Edge for best results.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure speech recognition options
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true; // Need interim results for better continuity, but we'll only use final ones
    recognitionRef.current.lang = lang;

    // Set up event handlers
    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setHasError(false);
      setErrorMessage(null);
    };

    recognitionRef.current.onend = () => {
      // If we're still supposed to be recording, restart it
      // This handles the auto-stop that browsers implement
      if (isRecording) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          // Prevent potential errors when rapidly starting/stopping
          console.log('Error restarting recognition', error);
        }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        setHasError(true);
        setErrorMessage('Microphone access denied. Please allow microphone access in your browser settings.');
        setIsRecording(false);
        if (onPermissionDenied) {
          onPermissionDenied();
        }
      } else if (event.error === 'no-speech') {
        // This is common and not a critical error, so we don't show the error UI
        console.log('No speech detected, continuing to listen...');
      } else {
        setHasError(true);
        setErrorMessage(`Error: ${event.error}. Please try again.`);
        setIsRecording(false);
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      // Only update with final transcripts and append to existing transcript
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript + ' ');
      }
    };

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors when stopping
        }
      }
    };
  }, [lang, onPermissionDenied, isRecording]);

  // Start recording function
  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setHasError(false);
    setErrorMessage(null);
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      setHasError(true);
      setErrorMessage(error.message || 'Error starting speech recognition. Please refresh and try again.');
    }
  }, []);

  // Stop recording function
  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isRecording,
    hasError,
    errorMessage,
    startRecording,
    stopRecording,
    resetTranscript,
    supported
  };
}
