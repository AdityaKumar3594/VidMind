import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import ChatPanel from './ChatPanel'

const TABS = [
  { key: 'summary',        label: '📋 Summary' },
  { key: 'action_items',   label: '✅ Action Items' },
  { key: 'key_decisions',  label: '🔑 Decisions' },
  { key: 'open_questions', label: '❓ Questions' },
  { key: 'transcript',     label: '📝 Transcript' },
]

export default function ResultsScreen({ result, onReset }) {
  const [activeTab, setActiveTab] = useState('summary')
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onReset}
          className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1"
        >
          ← New Video
        </button>
        <h1 className="text-lg font-bold text-white">
          Vid<span className="text-violet-400">Mind</span>
        </h1>
        <button
          onClick={() => setChatOpen(o => !o)}
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          💬 Chat
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6">{result.title}</h2>

        {/* Tab bar */}
        <div className="flex gap-1 flex-wrap bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{result[activeTab] || '_No data available._'}</ReactMarkdown>
        </div>
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <ChatPanel
          sessionId={result.session_id}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  )
}
