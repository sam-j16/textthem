"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Send, Battery, Wifi, Image, Mic } from "lucide-react"

export default function StartTalking() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [currentTime, setCurrentTime] = useState("")

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
          <div className="text-xs text-gray-400">Online</div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 p-4 overflow-y-auto bg-black">
        <div className="flex flex-col space-y-3">
          <div className="max-w-[80%] p-3 rounded-2xl bg-gray-700 text-white self-start rounded-bl-sm">
            <p>I'm here to listen. How are you feeling today?</p>
            <div className="text-xs text-gray-400 mt-1">{currentTime}</div>
          </div>

          <div className="flex justify-center my-8">
            <div className="text-center text-gray-400 text-sm">
              <p>This is where your backend integration would start.</p>
              <p>Users can now talk to your AI companion.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message input */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
          <button className="mr-2 text-gray-400">
            <Image className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-transparent outline-none"
          />
          {message.trim() ? (
            <button className="ml-2 text-blue-500">
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button className="ml-2 text-gray-400">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* iPhone home indicator */}
      <div className="py-2 flex justify-center bg-black">
        <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  )
}

