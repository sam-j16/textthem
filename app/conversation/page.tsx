"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Send, Battery, Wifi, Mic, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: string
}

export default function Conversation() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [analysis, setAnalysis] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Time update function
  const updateTime = () => {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12
    setCurrentTime(`${hours}:${minutes} ${ampm}`)
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          analysis: analysis
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Handle textarea resize
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }

  // Initialize chat
  useEffect(() => {
    // Get analysis from localStorage
    const storedAnalysis = localStorage.getItem('conversationAnalysis')
    if (storedAnalysis) {
      setAnalysis(storedAnalysis)
    }

    // Add welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "Hi! I've analyzed your conversation style. How can I help you today?",
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages([welcomeMessage])

    // Set up time updates
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        <button 
          onClick={() => router.back()} 
          className="mr-2 p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5 text-blue-500" />
        </button>
        <div className="flex-1">
          <div className="font-semibold text-sm">AI Companion</div>
          <div className="text-xs text-gray-400">Chat</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-gray-700 text-white rounded-bl-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                <p className="text-xs text-gray-300 mt-1 opacity-70">{message.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center bg-gray-800 rounded-full px-3 py-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTextareaInput(e)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Message..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-sm"
            rows={1}
            style={{ maxHeight: "150px" }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || loading}
            className={`ml-2 p-1 rounded-full ${
              !newMessage.trim() || loading
                ? "text-gray-500"
                : "text-blue-500"
            }`}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* iPhone home indicator */}
      <div className="py-1 flex justify-center bg-black">
        <div className="w-24 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  )
} 