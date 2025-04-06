"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Upload, X, AlertCircle, Battery, Wifi } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function StartTalking() {
  const router = useRouter()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [contextText, setContextText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState("")
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

  // Initialize time
  React.useEffect(() => {
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedImages(prev => [...prev, ...filesArray])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

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

      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
        <button 
          onClick={() => router.back()} 
          className="mr-2 p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5 text-blue-500" />
        </button>
        <div className="flex-1">
          <div className="font-semibold text-sm">Upload Screenshots</div>
          <div className="text-xs text-gray-400">Start a conversation</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto bg-black">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Upload Text Message Screenshots</h2>
          <p className="text-sm text-gray-400 mb-4">
            Upload screenshots of text conversations to analyze the communication style.
          </p>
          
          {/* Image Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-700 rounded-lg p-4 mb-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              ref={fileInputRef}
            />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-400">Tap to select images</p>
            <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
          </div>
          
          {/* Selected Images */}
          {selectedImages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Selected Images ({selectedImages.length})</h3>
              <div className="grid grid-cols-3 gap-2">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Context Input */}
          <div className="mb-4">
            <label htmlFor="context" className="block text-sm font-medium mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              id="context"
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Add any additional context about the conversation..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400">{error}</p>
                <p className="text-xs text-gray-400 mt-1">
                  If this error persists, please contact support.
                </p>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || selectedImages.length === 0}
            className={`w-full py-3 px-4 rounded-full font-medium text-sm ${
              loading || selectedImages.length === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
          >
            {loading ? 'Processing...' : 'Start Conversation'}
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