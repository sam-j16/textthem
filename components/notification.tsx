"use client"

import React from "react"
import { motion } from "framer-motion"

interface NotificationProps {
  title: string
  message: string
  time: string
}

export default function Notification({ title, message, time }: NotificationProps) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-4 left-4 right-4 bg-gray-800 rounded-xl overflow-hidden shadow-lg z-50"
    >
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white font-bold">D</span>
            </div>
            <div>
              <div className="font-semibold">{title}</div>
              <div className="text-xs text-gray-400">now</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">{time}</div>
        </div>
        <div className="mt-2">{message}</div>
      </div>
    </motion.div>
  )
}

