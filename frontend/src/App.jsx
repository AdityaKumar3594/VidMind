import { useState } from 'react'
import InputScreen from './components/InputScreen'
import ResultsScreen from './components/ResultsScreen'
import Loader from './components/Loader'
import { processUrl, processFile } from './api'

export default function App() {
  const [state, setState] = useState('idle')   // 'idle' | 'loading' | 'done'
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit({ type, value, language }) {
    setState('loading')
    setError(null)
    try {
      const data =
        type === 'url'
          ? await processUrl(value, language)
          : await processFile(value, language)
      setResult(data)
      setState('done')
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message)
      setState('idle')
    }
  }

  if (state === 'loading') return <Loader />

  if (state === 'done' && result)
    return <ResultsScreen result={result} onReset={() => { setState('idle'); setResult(null) }} />

  return (
    <>
      <InputScreen onSubmit={handleSubmit} loading={state === 'loading'} />
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-900 border border-red-700 text-red-200 text-sm px-5 py-3 rounded-xl shadow-lg">
          ⚠ {error}
        </div>
      )}
    </>
  )
}
