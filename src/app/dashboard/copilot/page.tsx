'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, TrendingUp, Package, AlertTriangle, ShoppingCart, BarChart3 } from 'lucide-react'
import { Card, PageHeader, Badge } from '@/app/components/ui'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'data' | 'action'
  data?: any
}

const quickActions = [
  { icon: Package, label: 'Low stock items', prompt: 'Which products have low stock and need reordering?' },
  { icon: TrendingUp, label: 'Sales trends', prompt: 'Show me my top selling products this month' },
  { icon: AlertTriangle, label: 'Risk alerts', prompt: 'Which products are at risk of running out?' },
  { icon: ShoppingCart, label: 'Auto-orders', prompt: 'What auto-orders were triggered recently?' },
  { icon: BarChart3, label: 'Inventory stats', prompt: 'Give me a summary of my inventory status' },
]

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm SupplyChain Co-Pilot. I can help you with:\n\n• Inventory status and low stock alerts\n• Sales trends and predictions\n• Auto-order recommendations\n• Supplier performance insights\n\nWhat would you like to know?",
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: input,
          orgId: 'demo-org'
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        type: data.type || 'text',
        data: data.data
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <PageHeader 
        title="SupplyChain Co-Pilot" 
        subtitle="AI-powered insights for your supply chain"
        action={
          <Badge variant="info" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </Badge>
        }
      />

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-primary-600" />
                </div>
              )}
              
              <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {message.type === 'data' && message.data && (
                  <div className="mt-3 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                    {message.data.title && (
                      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 font-medium text-sm text-slate-700">
                        {message.data.title}
                      </div>
                    )}
                    <div className="p-4">
                      {message.data.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-slate-700">{item.label}</span>
                          <span className={`font-medium ${item.variant === 'danger' ? 'text-red-600' : item.variant === 'warning' ? 'text-yellow-600' : 'text-slate-900'}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-xs text-slate-400 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {message.role === 'user' && (
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 order-2">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-primary-600" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                <span className="text-slate-500 text-sm">Analyzing your data...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {!messages.some(m => m.role === 'user') && (
          <div className="px-6 pb-4">
            <p className="text-sm text-slate-500 mb-3">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your inventory, sales, or orders..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}