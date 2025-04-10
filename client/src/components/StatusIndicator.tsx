interface StatusIndicatorProps {
  isRecording: boolean;
  hasError: boolean;
}

export default function StatusIndicator({ isRecording, hasError }: StatusIndicatorProps) {
  if (hasError) {
    return (
      <span className="inline-flex items-center text-sm text-red-600">
        <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
        Error
      </span>
    );
  }

  if (isRecording) {
    return (
      <span className="inline-flex items-center text-sm text-green-600">
        <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
        Recording...
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-sm text-slate-500">
      <span className="h-2 w-2 bg-slate-400 rounded-full mr-2"></span>
      Not Recording
    </span>
  );
}
