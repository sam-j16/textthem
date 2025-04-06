"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Battery, Wifi } from "lucide-react"
import Notification from "@/components/notification"
import TypeWriter from "@/components/type-writer"

export default function Home() {
  const router = useRouter()
  const [typingComplete, setTypingComplete] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
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

  useEffect(() => {
    // After typing is complete, clear the message and show notification
    if (typingComplete) {
      const notificationTimer = setTimeout(() => {
        setShowNotification(true)

        // Automatically navigate to chat after showing notification
        const navigationTimer = setTimeout(() => {
          router.push("/chat")
        }, 2000) // Wait 2 seconds after notification appears

        return () => clearTimeout(navigationTimer)
      }, 1000)

      return () => clearTimeout(notificationTimer)
    }
  }, [typingComplete, router])

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

      {/* Main screen with message input */}
      <div className="flex-1 flex flex-col justify-end p-4 relative">
        {/* Notification overlay */}
        {showNotification && <Notification title="Diary" message="Ever felt like that?" time={currentTime} />}
      </div>

      {/* Message input area */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
          {!typingComplete ? (
            <TypeWriter
              text="Hey dad. I've been overwhelmed from a couple..."
              speed={70}
              onComplete={() => setTypingComplete(true)}
            />
          ) : (
            <input
              type="text"
              value=""
              placeholder="Message..."
              className="flex-1 bg-transparent outline-none"
              readOnly
            />
          )}
          <button className={`ml-2 font-semibold ${typingComplete ? "text-gray-500" : "text-blue-500"}`}>Send</button>
        </div>
      </div>

      {/* iPhone home indicator */}
      <div className="py-2 flex justify-center bg-black">
        <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  )
}

