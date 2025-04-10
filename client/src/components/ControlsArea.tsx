import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2 } from "lucide-react";

interface ControlsAreaProps {
  isRecording: boolean;
  toggleRecording: () => void;
  clearTranscript: () => void;
}

export default function ControlsArea({ isRecording, toggleRecording, clearTranscript }: ControlsAreaProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
      <Button
        onClick={toggleRecording}
        className={`flex items-center justify-center gap-2 font-medium py-3 px-6 rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 w-full md:w-auto ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
        }`}
      >
        {isRecording ? (
          <>
            <Square className="h-5 w-5" />
            <span>Stop Recording</span>
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            <span>Start Recording</span>
          </>
        )}
      </Button>
      
      <Button
        onClick={clearTranscript}
        variant="outline"
        className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-6 rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 w-full md:w-auto"
      >
        <Trash2 className="h-5 w-5" />
        <span>Clear</span>
      </Button>
    </div>
  );
}
