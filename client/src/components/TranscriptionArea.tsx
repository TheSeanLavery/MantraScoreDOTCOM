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
        className="p-4 h-64 md:h-80 overflow-y-auto transcript-area"
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
      </div>
    </div>
  );
}
