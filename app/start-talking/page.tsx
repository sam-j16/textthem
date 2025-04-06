"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Send, Battery, Wifi, Image, Mic, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function StartTalking() {
  const router = useRouter()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [contextText, setContextText] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Image upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Validate file types
      const validFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      )
      
      if (validFiles.length === 0) {
        setError("Please select valid image files")
        return
      }
      
      setSelectedImages(validFiles)
      setError(null)
    }
  }

  // Form submission handler
  const handleSubmit = async () => {
    if (selectedImages.length === 0) {
      setError("Please upload at least one image")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    selectedImages.forEach((file) => {
      formData.append('images', file)
    })
    formData.append('context', contextText)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Store the analysis data in localStorage instead of passing it through URL
      try {
        // Store the analysis data in localStorage
        localStorage.setItem('conversationAnalysis', data.analysis)
        
        // Navigate to conversation page without parameters
        router.push('/conversation')
      } catch (storageError) {
        console.error("Error storing analysis data:", storageError)
        setError("Failed to process analysis data. Please try again.")
      }

    } catch (err) {
      console.error("Error during image analysis:", err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Effect for time update
  useEffect(() => {
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

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
          <div className="text-xs text-gray-400">Image Analysis</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto bg-black">
        {/* Image Upload Section */}
        <div className="mb-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
          >
            <input 
              type="file" 
              multiple 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            <Image className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-400">
              {selectedImages.length > 0 
                ? `${selectedImages.length} image(s) selected` 
                : "Click to upload conversation screenshots"}
            </p>
          </div>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {selectedImages.map((file, index) => (
                <img 
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Uploaded image ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </div>

        {/* Context Input */}
        <textarea 
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
          placeholder="Optional: Provide additional context about the conversation"
          className="w-full bg-gray-800 rounded-lg p-3 mb-4 text-white min-h-[100px]"
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
              <p className="text-xs mt-2 text-gray-400">
                If this error persists, please try again later or contact support.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-full text-white font-semibold transition-colors ${
            loading 
              ? "bg-gray-700 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing...
            </div>
          ) : (
            "Start Conversation"
          )}
        </motion.button>
      </div>
    </div>
  )
}