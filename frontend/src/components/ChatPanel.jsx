import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { chat } from '../api'

export default function ChatPanel({ sessionId, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask me anything about this video.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const answer = await chat(sessionId, q)
      setMessages(m => [...m, { role: 'assistant', text: answer }])
    } catch (err) {
      setMessages(m => [
        ...m,
        { role: 'assistant', text: `Error: ${err.response?.data?.detail ?? err.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[600px] flex flex-col bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="font-semibold text-sm text-white">💬 Chat with Video</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg leading-none transition-colors"
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none'
              }`}
            >
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 px-3 py-2 rounded-xl rounded-bl-none text-sm">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-3 border-t border-gray-800">
        <textarea
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question…"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          aria-label="Send message"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
