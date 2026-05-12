import { useState, useRef, useEffect } from 'react'
import { Send, Activity, ShieldAlert, ShieldCheck, Zap } from 'lucide-react'
import axios from 'axios'

function App() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your Self-Reflective RAG assistant. Ask me a question about the uploaded documents.(Documents uploaded: 1.Attention Is All You Need, 2.Sparks of Artificial General Intelligence Early experiments with GPT-4)' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [telemetry, setTelemetry] = useState(null)
  
  // Auto-scroll to bottom of chat
  const chatEndRef = useRef(null)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!query.trim()) return
    
    // 1. Add user message to UI
    const userMsg = { role: 'user', content: query }
    setMessages(prev => [...prev, userMsg])
    setQuery('')
    setIsLoading(true)

    try {
      // 2. Call the FastAPI Backend
      const response = await axios.post('http://127.0.0.1:8000/api/ask', {
        query: userMsg.content,
        top_k: 3 // Starting with 3, the backend will expand to 6 if self-healing triggers
      })

      // 3. Update UI with AI response and telemetry
      setMessages(prev => [...prev, { role: 'ai', content: response.data.answer }])
      setTelemetry({
        ...response.data.metrics,
        latency: response.data.latency_ms
      })
      
    } catch (error) {
      console.error("API Error:", error)
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to the server." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Left Sidebar: RAG Observability */}
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
              
              {/* Status Banner */}
              <div className={`p-4 rounded-lg flex items-start gap-3 ${telemetry.self_healing_triggered ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-green-50 text-green-900 border border-green-200'}`}>
                {telemetry.self_healing_triggered ? <ShieldAlert className="text-amber-600 shrink-0" /> : <ShieldCheck className="text-green-600 shrink-0" />}
                <div>
                  <p className="font-bold text-sm">
                    {telemetry.self_healing_triggered ? "Self-Healing Triggered" : "System Stable"}
                  </p>
                  <p className="text-xs mt-1 opacity-80">
                    {telemetry.self_healing_triggered 
                      ? "High hallucination risk detected. Context window automatically expanded." 
                      : "Risk within acceptable limits. Standard retrieval used."}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
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
                  <p className="text-xs text-gray-500 uppercase font-semibold">Score Spread</p>
                  <p className="text-lg font-bold text-gray-700">{telemetry.score_spread.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Latency</p>
                  <p className="text-lg font-bold text-indigo-600 flex items-center gap-1">
                    <Zap size={14} /> {telemetry.latency}ms
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Chat Interface */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        
        {/* Chat History Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
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
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">AI</div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the document..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button 
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white rounded-md transition-colors ${isLoading || !query.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={handleSend}
              disabled={isLoading || !query.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App