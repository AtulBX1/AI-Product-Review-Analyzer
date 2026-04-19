import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAnalysis } from '../hooks/useAnalysis'
import SearchInput from '../components/SearchInput'
import ResultsView from '../components/ResultsView'
import SkeletonLoader from '../components/SkeletonLoader'

export default function Analyze() {
  const [params] = useSearchParams()
  const { status, data, error, analyze, reset } = useAnalysis()

  useEffect(() => {
    const product = params.get('product')
    const platform = params.get('platform') || 'all'
    if (product) analyze(product, platform, 'quick')
  }, [])

  const statusMsg = {
    fetching: 'Searching for reviews across the web...',
    analyzing: 'Gemini AI is reading and analyzing reviews...',
    done: 'Analysis complete'
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white px-4 py-8 max-w-5xl mx-auto">
      <SearchInput onAnalyze={analyze} onReset={reset} />
      {(status === 'fetching' || status === 'analyzing') && (
        <div className="mt-8">
          <p className="text-accent text-sm mb-6 animate-pulse">{statusMsg[status]}</p>
          <SkeletonLoader />
        </div>
      )}
      {status === 'error' && <div className="mt-8 bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-400">{error}</div>}
      {status === 'done' && data && <ResultsView data={data} />}
    </div>
  )
}