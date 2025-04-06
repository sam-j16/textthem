"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Battery, Wifi, Send, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Conversation() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; timestamp: string }[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Time update function
  const updateTime = () => {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12
    return `${hours}:${minutes} ${ampm}`
  }

  useEffect(() => {
    try {
      // Get analysis from localStorage instead of URL parameters
      const storedAnalysis = localStorage.getItem('conversationAnalysis')

      if (storedAnalysis) {
        setAnalysis(storedAnalysis)
        
        // Add initial AI message
        const initialMessage = {
          text: "Hi! I've analyzed your conversation style. How can I help you today?",
          isUser: false,
          timestamp: updateTime()
        }
        setMessages([initialMessage])
      } else {
        // If analysis data is missing, redirect back to start-talking
        router.push('/start-talking')
      }
    } catch (err) {
      console.error("Error retrieving analysis data:", err)
      setError("Failed to load conversation data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [router])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    // Add user message
    const userMessage = {
      text: newMessage,
      isUser: true,
      timestamp: updateTime()
    }
    
    setMessages(prev => [...prev, userMessage])
    setNewMessage("")
    setSending(true)

    try {
      // Send message to API for processing
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          analysis: analysis
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Add AI response
      const aiMessage = {
        text: data.reply,
        isUser: false,
        timestamp: updateTime()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage = {
        text: "Sorry, I couldn't process your message. Please try again.",
        isUser: false,
        timestamp: updateTime()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* iPhone status bar */}
      <div className="flex justify-between items-center px-5 py-2 bg-black">
        <div className="text-sm font-medium">{currentTime}</div>
        <div className="flex items-center space-x-2">
          <Wifi className="h-4 w-4" />
          <div className="text-sm">8%</div>
          <Battery className="h-4 w-4" />
        </div>
      </div>

      {/* Chat header */}
      <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
        <button onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-blue-500" />
        </button>
        <div className="flex-1">
          <div className="font-semibold">AI Companion</div>
          <div className="text-xs text-gray-400">Conversation</div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-black">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-red-500 mb-2">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Error</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/start-talking')}
              className="px-4 py-2 bg-blue-500 rounded-full text-white font-medium"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.isUser 
                        ? 'bg-blue-500 text-white rounded-br-sm' 
                        : 'bg-gray-700 text-white rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className="text-xs text-gray-300 mt-1 opacity-70">{msg.timestamp}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none"
            disabled={sending || !!error}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={sending || !newMessage.trim() || !!error}
            className={`ml-2 ${sending || !newMessage.trim() || !!error ? 'text-gray-500' : 'text-blue-500'} font-semibold`}
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* iPhone home indicator */}
      <div className="py-2 flex justify-center bg-black">
        <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  )
} 