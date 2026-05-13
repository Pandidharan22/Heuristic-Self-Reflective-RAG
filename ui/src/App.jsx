import { useState, useRef, useEffect } from 'react'
import { Send, Activity, ShieldAlert, ShieldCheck, Zap, BarChart3, MessageSquare, AlertTriangle } from 'lucide-react'
import axios from 'axios'

function App() {
  const [view, setView] = useState('chat') // 'chat' or 'benchmark'
  
  // Chat State
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your Self-Reflective RAG assistant. Ask me a question about the uploaded documents.\n\n(Documents loaded: 1. Attention Is All You Need, 2. Sparks of AGI)' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [telemetry, setTelemetry] = useState(null)
  
  // Benchmark State
  const [benchmarkData, setBenchmarkData] = useState(null)

  const chatEndRef = useRef(null)
  useEffect(() => {
    if (view === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, view])

  // Load Benchmark Data when switching views
  useEffect(() => {
    if (view === 'benchmark' && !benchmarkData) {
      axios.get('/benchmark_results.json')
        .then(res => setBenchmarkData(res.data))
        .catch(err => console.error("Failed to load benchmark data. Run the arena script first!", err))
    }
  }, [view])

  const handleSend = async () => {
    if (!query.trim()) return
    const userMsg = { role: 'user', content: query }
    setMessages(prev => [...prev, userMsg])
    setQuery('')
    setIsLoading(true)

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/ask', {
        query: userMsg.content,
        top_k: 3 
      })
      setMessages(prev => [...prev, { role: 'ai', content: response.data.answer }])
      setTelemetry({ ...response.data.metrics, latency: response.data.latency_ms })
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Error connecting to backend." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Global Navigation Sidebar */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-6 gap-6 shadow-xl z-10">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold mb-4">
          AI
        </div>
        <button 
          onClick={() => setView('chat')}
          className={`p-3 rounded-xl transition-all ${view === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          title="Live Chat"
        >
          <MessageSquare size={24} />
        </button>
        <button 
          onClick={() => setView('benchmark')}
          className={`p-3 rounded-xl transition-all ${view === 'benchmark' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          title="Benchmark Report"
        >
          <BarChart3 size={24} />
        </button>
      </div>

      {/* --- LIVE CHAT VIEW --- */}
      {view === 'chat' && (
        <>
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <Activity className="text-blue-600" />
              <h1 className="text-xl font-bold">Observability</h1>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {!telemetry ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm text-center">
                  <Activity size={32} className="mb-2 opacity-50" />
                  <p>Send a message to view<br/>RAG telemetry data</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg flex items-start gap-3 ${telemetry.self_healing_triggered ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-green-50 text-green-900 border border-green-200'}`}>
                    {telemetry.self_healing_triggered ? <ShieldAlert className="text-amber-600 shrink-0" /> : <ShieldCheck className="text-green-600 shrink-0" />}
                    <div>
                      <p className="font-bold text-sm">{telemetry.self_healing_triggered ? "Self-Reflection Triggered" : "System Stable"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Confidence</p>
                      <p className="text-lg font-bold text-blue-700">{telemetry.confidence_score.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Final Risk</p>
                      <p className="text-lg font-bold text-rose-600">{telemetry.final_risk.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Latency</p>
                      <p className="text-lg font-bold text-indigo-600 flex items-center gap-1"><Zap size={14} /> {telemetry.latency}ms</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-gray-50/50 relative">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-6 pb-20">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-blue-600 text-white'}`}>
                      {msg.role === 'user' ? 'U' : 'AI'}
                    </div>
                    <div className={`p-4 rounded-lg shadow-sm border max-w-[80%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-200 absolute bottom-0 w-full">
              <div className="max-w-3xl mx-auto relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <button 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white rounded-md ${isLoading || !query.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  onClick={handleSend}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- BENCHMARK VIEW --- */}
      {view === 'benchmark' && (
        <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Automated Benchmark Report</h1>
              <p className="text-gray-500">Methodology: 50 automated queries comparing Naive RAG vs Self-Reflective Architecture.</p>
            </div>

            {!benchmarkData ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-40 bg-gray-200 rounded"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-6">
                  {/* KPI Cards */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="text-yellow-500" />
                      <h3 className="font-bold text-gray-700">Average Latency</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-500">Naive RAG:</span><span className="font-mono">{benchmarkData.stats.avg_latency_naive}ms</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Self-Reflective:</span><span className="font-mono">{benchmarkData.stats.avg_latency_heuristic}ms</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="text-rose-500" />
                      <h3 className="font-bold text-gray-700">OOD Hallucinations</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-500">Naive RAG:</span><span className="font-mono text-green-600">{benchmarkData.stats.naive.hallucinations} / 15</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Self-Reflective:</span><span className="font-mono text-rose-600">{benchmarkData.stats.heuristic.hallucinations} / 15</span></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 italic">Note: Context expansion occasionally increases noise on purely out-of-domain queries.</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <ShieldCheck className="text-blue-500" />
                      <h3 className="font-bold text-gray-700">Self-Reflection Activations</h3>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-4xl font-black text-blue-600">{benchmarkData.stats.heuristic.self_healing_triggers}</span>
                      <span className="text-gray-500 mb-1">/ 50 queries</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Raw Query Logs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Query</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3 text-center">Heuristic Risk</th>
                          <th className="px-6 py-3 text-center">Self-Reflected?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {benchmarkData.results.map((r, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-xs" title={r.query}>{r.query}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs ${r.type.includes('easy') ? 'bg-green-100 text-green-800' : r.type.includes('hard') ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'}`}>
                                {r.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-mono">{r.heuristic.risk.toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">
                              {r.heuristic.healed ? <span className="text-amber-500 font-bold">YES</span> : <span className="text-gray-300">NO</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default App