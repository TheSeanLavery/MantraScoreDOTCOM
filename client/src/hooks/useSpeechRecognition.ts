import { useState, useEffect, useRef, useCallback } from 'react';

// Global variables to persist across unmounts/remounts
let globalRecognitionInstance: any = null;
let activeUsers = 0;

// Use localStorage to persist recording state across remounts
const setRecordingState = (isRecording: boolean) => {
  try {
    localStorage.setItem('mantra-score-recording', isRecording ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save recording state', e);
  }
};

const getRecordingState = (): boolean => {
  try {
    return localStorage.getItem('mantra-score-recording') === 'true';
  } catch (e) {
    console.error('Failed to get recording state', e);
    return false;
  }
};

// Initialize from localStorage if available
let keepRecording = getRecordingState();

interface SpeechRecognitionOptions {
  onPermissionDenied?: () => void;
  lang?: string;
}

interface SpeechRecognitionHook {
  transcript: string;
  interimText: string;
  isRecording: boolean;
  isListening: boolean;
  hasError: boolean;
  errorMessage: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  supported: boolean;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isRecording, setIsRecording] = useState(keepRecording);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  const { onPermissionDenied, lang = 'en-US' } = options;

  // Debug logging function
  const logEvent = (event: string, details?: any) => {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [Recognition] ${event}`;
    
    if (details) {
      console.log(message, details);
    } else {
      console.log(message);
    }
  };

  // Setup recognition instance
  const setupRecognition = useCallback(() => {
    // If we already have a global instance, just increment users
    if (globalRecognitionInstance) {
      logEvent('Reusing existing recognition instance');
      activeUsers++;
      return globalRecognitionInstance;
    }

    logEvent('Creating new speech recognition instance');
    
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      logEvent('Speech recognition NOT SUPPORTED');
      setSupported(false);
      setHasError(true);
      setErrorMessage('Speech recognition is not supported in this browser. Try Chrome or Edge for best results.');
      return null;
    }
    
    // Create new instance
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure properties
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;
    
    // Set up event handlers
    recognition.onstart = () => {
      logEvent('Recognition STARTED');
      setIsRecording(true);
      setHasError(false);
      setErrorMessage(null);
    };
    
    recognition.onend = () => {
      logEvent('Recognition ENDED');
      
      // If we want to keep recording, restart
      if (keepRecording) {
        logEvent('Attempting to restart recognition');
        try {
          setTimeout(() => {
            if (keepRecording) {
              recognition.start();
              logEvent('Recognition restarted successfully');
            }
          }, 100);
        } catch (e) {
          logEvent('Failed to restart recognition', e);
        }
      } else {
        logEvent('Not restarting - recording stopped by user');
        setIsRecording(false);
        setIsListening(false);
      }
    };
    
    recognition.onsoundstart = () => {
      logEvent('Sound detected');
      setIsListening(true);
    };
    
    recognition.onsoundend = () => {
      logEvent('Sound ended');
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      logEvent(`ERROR: ${event.error}`, event);
      
      if (event.error === 'not-allowed') {
        logEvent('Permission denied error');
        setHasError(true);
        setErrorMessage('Microphone access denied. Please allow microphone access in your browser settings.');
        setIsRecording(false);
        keepRecording = false;
        setRecordingState(false);
        
        if (onPermissionDenied) {
          onPermissionDenied();
        }
      } else if (event.error === 'no-speech') {
        // This is expected - just log it
        logEvent('No speech detected, continuing...');
      } else {
        // For unexpected errors, log but try to continue
        if (keepRecording) {
          // Try to restart after error
          setTimeout(() => {
            try {
              if (keepRecording && globalRecognitionInstance) {
                globalRecognitionInstance.start();
                logEvent('Restarted after error');
              }
            } catch (e) {
              logEvent('Failed to restart after error', e);
              setHasError(true);
              setErrorMessage('Speech recognition error. Please try again.');
            }
          }, 1000);
        } else {
          setHasError(true);
          setErrorMessage(`Error: ${event.error}. Please try again.`);
          setIsRecording(false);
        }
      }
    };
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          logEvent(`Final result: "${event.results[i][0].transcript}"`);
          currentInterim = '';
        } else {
          currentInterim = event.results[i][0].transcript;
          logEvent(`Interim result: "${currentInterim}"`);
        }
      }
      
      setInterimText(currentInterim);
      
      if (finalTranscript) {
        setTranscript(prev => {
          const newTranscript = prev + finalTranscript + ' ';
          return newTranscript;
        });
      }
    };
    
    // Save to global reference and increment user count
    globalRecognitionInstance = recognition;
    activeUsers++;
    
    return recognition;
  }, [lang, onPermissionDenied]);

  // Initialize on component mount
  useEffect(() => {
    logEvent(`Component mounted - keepRecording=${keepRecording}`);
    
    // Setup recognition
    const recognition = setupRecognition();
    
    // If we should be recording, start recording immediately
    if (keepRecording && recognition) {
      logEvent('Auto-starting recording after mount');
      try {
        recognition.start();
      } catch (e) {
        logEvent('Failed to auto-start recording', e);
      }
    }
    
    // Clean up on unmount
    return () => {
      logEvent(`Component unmounting - keepRecording=${keepRecording}`);
      
      // Decrement user count
      activeUsers--;
      
      // If this is the last user, stop recognition and clean up global instance
      if (activeUsers === 0) {
        logEvent('Last user unmounting, cleaning up global instance');
        
        // Don't reset keepRecording here so it persists through remounts
        
        if (globalRecognitionInstance) {
          try {
            // Only actually stop if we don't want to keep recording
            if (!keepRecording) {
              globalRecognitionInstance.stop();
            }
          } catch (e) {
            // Ignore errors when stopping
          }
        }
      } else {
        logEvent(`Component unmounting but ${activeUsers} users remain`);
      }
    };
  }, [setupRecognition]);

  // Start recording function
  const startRecording = useCallback(() => {
    logEvent('USER ACTION: Start recording');
    
    if (!globalRecognitionInstance) {
      logEvent('ERROR: Cannot start - recognition not initialized');
      return;
    }
    
    setHasError(false);
    setErrorMessage(null);
    keepRecording = true;
    setRecordingState(true);
    
    try {
      logEvent('Starting recognition');
      globalRecognitionInstance.start();
      setIsRecording(true);
    } catch (error: any) {
      logEvent('ERROR starting recognition', error);
      setHasError(true);
      setErrorMessage(error.message || 'Error starting speech recognition. Please refresh and try again.');
      keepRecording = false;
      setRecordingState(false);
    }
  }, []);

  // Stop recording function
  const stopRecording = useCallback(() => {
    logEvent('USER ACTION: Stop recording');
    
    // Prevent auto-restart
    keepRecording = false;
    setRecordingState(false);
    
    if (!globalRecognitionInstance) {
      return;
    }
    
    try {
      logEvent('Stopping recognition');
      globalRecognitionInstance.stop();
      setIsRecording(false);
    } catch (error) {
      logEvent('ERROR stopping recognition', error);
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    logEvent('USER ACTION: Reset transcript');
    setTranscript('');
  }, []);
  
  return {
    transcript,
    interimText,
    isRecording,
    isListening,
    hasError,
    errorMessage,
    startRecording,
    stopRecording,
    resetTranscript,
    supported
  };
}
