import { useState, useRef } from 'react'

const LANGUAGES = [
  { value: 'english', label: '🇬🇧 English' },
  { value: 'hinglish', label: '🇮🇳 Hinglish' },
]

export default function InputScreen({ onSubmit, loading }) {
  const [tab, setTab] = useState('url')          // 'url' | 'file'
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [language, setLanguage] = useState('english')
  const [drag, setDrag] = useState(false)
  const fileRef = useRef()

  function handleSubmit(e) {
    e.preventDefault()
    if (tab === 'url' && url.trim()) onSubmit({ type: 'url', value: url.trim(), language })
    if (tab === 'file' && file)      onSubmit({ type: 'file', value: file, language })
  }

  function handleDrop(e) {
    e.preventDefault()
    setDrag(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) { setFile(dropped); setTab('file') }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Vid<span className="text-violet-400">Mind</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Transcribe · Summarize · Chat with any video</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl"
        >
          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-800 p-1 mb-5">
            {['url', 'file'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  tab === t
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'url' ? '🔗 YouTube URL' : '📁 Local File'}
              </button>
            ))}
          </div>

          {/* URL input */}
          {tab === 'url' && (
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm mb-4"
            />
          )}

          {/* File drop zone */}
          {tab === 'file' && (
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              className={`w-full border-2 border-dashed rounded-lg px-4 py-8 text-center cursor-pointer transition-colors mb-4 ${
                drag
                  ? 'border-violet-400 bg-violet-950'
                  : 'border-gray-700 hover:border-violet-600 bg-gray-800'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
              />
              {file ? (
                <p className="text-violet-300 text-sm font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-gray-400 text-sm">Drop an audio/video file here</p>
                  <p className="text-gray-600 text-xs mt-1">or click to browse</p>
                </>
              )}
            </div>
          )}

          {/* Language */}
          <div className="flex gap-2 mb-5">
            {LANGUAGES.map(l => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLanguage(l.value)}
                className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                  language === l.value
                    ? 'border-violet-500 bg-violet-600 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-violet-600 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (tab === 'url' ? !url.trim() : !file)}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {loading ? 'Processing…' : 'Analyze Video →'}
          </button>
        </form>
      </div>
    </div>
  )
}
