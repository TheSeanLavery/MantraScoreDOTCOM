export default function MicrophonePermissionGuide() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 shadow-sm">
      <h2 className="font-medium text-blue-700 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Microphone Access Required
      </h2>
      <p className="text-blue-600 text-sm mb-3">To use this application, please allow microphone access when prompted by your browser.</p>
      <div className="flex flex-col md:flex-row gap-2 text-sm text-slate-600">
        <div className="flex-1 bg-white p-3 rounded border border-slate-200">
          <strong className="block mb-1">Chrome/Edge:</strong>
          Click the camera/microphone icon in the address bar and select "Allow"
        </div>
        <div className="flex-1 bg-white p-3 rounded border border-slate-200">
          <strong className="block mb-1">Firefox:</strong>
          Look for the microphone permission popup at the top of your browser
        </div>
      </div>
    </div>
  );
}
