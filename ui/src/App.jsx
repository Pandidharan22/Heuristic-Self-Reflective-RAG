import { useState } from 'react'
import { Send, Activity } from 'lucide-react'

function App() {
  const [query, setQuery] = useState('')

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Left Sidebar: Telemetry & Observability (We will build this out later) */}
      <div className="w-1/3 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Activity className="text-blue-600" />
          <h1 className="text-xl font-bold">RAG Observability</h1>
        </div>
        <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-4 flex items-center justify-center text-gray-500">
          Telemetry Data will appear here
        </div>
      </div>

      {/* Right Side: Chat Interface */}
      <div className="flex-1 flex flex-col">
        
        {/* Chat History Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* System Greeting */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                AI
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                Hello! I am your Self-Reflective RAG assistant. Ask me a question about the uploaded documents.
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question..."
              className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              onKeyDown={(e) => e.key === 'Enter' && console.log("Enter pressed!")}
            />
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => console.log("Button clicked!")}
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