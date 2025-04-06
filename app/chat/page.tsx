"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Battery, Wifi } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Chat() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<{ text: string; timestamp: string }[]>([])
  const [currentTime, setCurrentTime] = useState("")
  const [showStartButton, setShowStartButton] = useState(false)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)

  // Define the exact messages in order
  const orderedMessages = [
    "Ever felt like that?",
    "It feels bad to tell them what you're going through because you don't wanna make them worry about what you're going through. It's hard. I get it.",
    "What if you can talk to them, without actually talking to them?",
    "Tell them how you've been feeling!",
    "Would it make you feel better?",
    "Or even better, give it a try?",
  ]

  useEffect(() => {
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const updateTime = () => {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12
    setCurrentTime(`${hours}:${minutes} ${ampm}`)
  }

  useEffect(() => {
    // Reset messages when component mounts
    setMessages([])

    // Display messages in sequence
    const timeoutIds: NodeJS.Timeout[] = []

    orderedMessages.forEach((text, index) => {
      const delay = index === 0 ? 500 : index * 2000 + 500

      const timeoutId = setTimeout(() => {
        setMessages((prev) => [...prev, { text, timestamp: currentTime }])

        // Show start button after last message
        if (index === orderedMessages.length - 1) {
          setTimeout(() => {
            setShowStartButton(true)
            setIsAnimationComplete(true)
          }, 1500)
        }
      }, delay)

      timeoutIds.push(timeoutId)
    })

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id))
    }
  }, [currentTime])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showStartButton])

  const handleStartTalking = () => {
    router.push("/start-talking")
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
          <div className="font-semibold">Diary</div>
          <div className="text-xs text-gray-400">iMessage</div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#000000]">
        <div className="flex flex-col space-y-3">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-[80%] p-3 rounded-2xl bg-gray-700 text-white self-start rounded-bl-sm"
              >
                <p>{msg.text}</p>
                <div className="text-xs text-gray-300 mt-1 opacity-70">{msg.timestamp}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {showStartButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mt-8"
            >
              <button
                onClick={handleStartTalking}
                className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium text-lg hover:bg-blue-600 transition-colors"
              >
                Start talking
              </button>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
          <input
            type="text"
            value=""
            placeholder="Message..."
            className="flex-1 bg-transparent outline-none"
            readOnly={isAnimationComplete}
          />
          <button className="ml-2 text-gray-500 font-semibold">Send</button>
        </div>
      </div>

      {/* iPhone home indicator */}
      <div className="py-2 flex justify-center bg-black">
        <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  )
}

