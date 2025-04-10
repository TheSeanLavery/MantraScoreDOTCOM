export default function AdditionalInfo() {
  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-5 mb-6">
      <h2 className="font-semibold text-slate-700 mb-3">Browser Compatibility Note</h2>
      <div className="text-sm text-slate-600 space-y-2">
        <p>The Web Speech API works best in:</p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li>Chrome (desktop & Android)</li>
          <li>Edge (desktop)</li>
          <li>Safari (desktop & iOS - may have limitations)</li>
          <li>Firefox (partial support)</li>
        </ul>
        <p className="text-slate-500 mt-3 italic">Results may vary depending on your browser and device.</p>
      </div>
    </div>
  );
}
