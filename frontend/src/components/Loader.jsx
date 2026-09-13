const STEPS = [
  'Downloading audio…',
  'Transcribing with Whisper…',
  'Building vector store…',
  'Generating summary…',
  'Extracting insights…',
]

export default function Loader() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        {/* Spinner */}
        <div className="w-14 h-14 rounded-full border-4 border-gray-800 border-t-violet-500 animate-spin mx-auto mb-8" />

        <h2 className="text-white font-semibold text-lg mb-2">Analyzing your video…</h2>
        <p className="text-gray-500 text-sm mb-8">This may take a minute depending on video length.</p>

        {/* Step list */}
        <ul className="space-y-2 text-left">
          {STEPS.map((s, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-700 flex-shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
