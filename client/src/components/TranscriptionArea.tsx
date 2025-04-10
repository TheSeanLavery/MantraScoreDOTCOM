import { useRef, useEffect } from "react";
import StatusIndicator from "./StatusIndicator";

interface TranscriptionAreaProps {
  transcript: string;
  isRecording: boolean;
  hasError: boolean;
}

export default function TranscriptionArea({ transcript, isRecording, hasError }: TranscriptionAreaProps) {
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when transcript changes
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden mb-6">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
        <h2 className="font-semibold text-slate-700">Transcription</h2>
        <StatusIndicator isRecording={isRecording} hasError={hasError} />
      </div>
      
      <div 
        ref={transcriptContainerRef}
        className="p-4 h-64 md:h-80 overflow-y-auto transcript-area relative"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#94a3b8 #f1f5f9'
        }}
      >
        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
          {transcript ? 
            transcript : 
            <p className="text-slate-400 italic text-center my-8">Your transcription will appear here...</p>
          }
        </div>
        
        {/* Audio Wave Indicator - only shows when recording but no error */}
        {isRecording && !hasError && (
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-1">
              {/* Audio wave animation */}
              <div className="flex items-end space-x-0.5 h-5">
                <div className="w-1 bg-blue-400 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0ms' }}></div>
                <div className="w-1 bg-blue-500 rounded-full animate-pulse" style={{ height: '70%', animationDelay: '150ms' }}></div>
                <div className="w-1 bg-blue-600 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '300ms' }}></div>
                <div className="w-1 bg-blue-500 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '450ms' }}></div>
                <div className="w-1 bg-blue-400 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '600ms' }}></div>
              </div>
              <span className="text-xs font-medium text-blue-600">Listening...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
