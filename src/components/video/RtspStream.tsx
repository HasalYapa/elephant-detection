'use client'

import { useState, useRef, useEffect } from 'react'
import { FileVideo, Play, Pause, Loader2, XCircle } from 'lucide-react'

interface RtspStreamProps {
  onFrame: (imageData: string) => void
}

export default function RtspStream({ onFrame }: RtspStreamProps) {
  const [rtspUrl, setRtspUrl] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamInterval = useRef<NodeJS.Timeout | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamInterval.current) {
        clearInterval(streamInterval.current)
      }
      stopStream()
    }
  }, [])

  // Start the RTSP stream
  const startStream = async () => {
    setError(null)
    
    if (!rtspUrl.trim()) {
      setError('Please enter a valid RTSP URL')
      return
    }
    
    // In a real implementation, this would connect to an RTSP proxy server
    // Since we can't directly connect to RTSP streams from the browser
    // This is a mock implementation for demonstration
    
    setIsLoading(true)
    
    try {
      // Mock connecting to stream
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsStreaming(true)
      setIsLoading(false)
      
      // Start capturing frames
      captureFrames()
    } catch (err) {
      setError('Failed to connect to RTSP stream')
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  // Stop the RTSP stream
  const stopStream = () => {
    if (streamInterval.current) {
      clearInterval(streamInterval.current)
      streamInterval.current = null
    }
    
    setIsStreaming(false)
  }

  // Capture frames from the stream
  const captureFrames = () => {
    if (streamInterval.current) {
      clearInterval(streamInterval.current)
    }
    
    // Mock sending frames every 200ms
    // In a real implementation, this would get frames from the video element
    streamInterval.current = setInterval(() => {
      // Generate mock video frame
      generateMockFrame()
    }, 200)
  }

  // Generate a mock video frame for demo purposes
  const generateMockFrame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Draw a mock frame (gray background with moving rectangle)
    const timestamp = Date.now()
    const width = canvas.width
    const height = canvas.height
    
    // Fill background
    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, width, height)
    
    // Draw time
    ctx.fillStyle = '#fff'
    ctx.font = '16px Arial'
    ctx.fillText(new Date().toLocaleTimeString(), 20, 30)
    
    // Draw moving object (to simulate motion)
    const x = 100 + Math.sin(timestamp / 500) * 50
    const y = 100 + Math.cos(timestamp / 700) * 30
    
    ctx.fillStyle = '#4caf50'
    ctx.fillRect(x, y, 80, 60)
    
    // Draw camera info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, height - 30, width, 30)
    ctx.fillStyle = '#fff'
    ctx.fillText(`RTSP: ${rtspUrl.substring(0, 30)}${rtspUrl.length > 30 ? '...' : ''}`, 10, height - 10)
    
    // Get frame as base64 and send to parent
    const frameData = canvas.toDataURL('image/jpeg', 0.8)
    onFrame(frameData)
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Stream display area */}
      <div className="relative bg-black aspect-video flex items-center justify-center">
        {/* Hidden canvas for frame capture */}
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={480} 
          className="hidden"
        />
        
        {/* Hidden video element for real implementation */}
        <video 
          ref={videoRef}
          className="hidden"
          muted
          playsInline
        />
        
        {!isStreaming && !isLoading && (
          <div className="flex flex-col items-center text-muted-foreground">
            <FileVideo size={48} className="mb-2" />
            <p>RTSP stream not connected</p>
          </div>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center text-muted-foreground">
            <Loader2 size={48} className="mb-2 animate-spin" />
            <p>Connecting to stream...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-destructive/90 text-destructive-foreground p-2 rounded-md text-sm flex items-center">
            <XCircle size={16} className="mr-2" />
            {error}
          </div>
        )}
        
        {/* Stream controls overlay */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {isStreaming && (
            <button
              onClick={stopStream}
              className="bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90"
              aria-label="Stop stream"
            >
              <Pause size={20} />
            </button>
          )}
          
          {!isStreaming && !isLoading && (
            <button
              onClick={startStream}
              className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90"
              aria-label="Start stream"
              disabled={!rtspUrl.trim()}
            >
              <Play size={20} />
            </button>
          )}
        </div>
      </div>
      
      {/* RTSP URL input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            placeholder="rtsp://username:password@camera-ip:port/stream"
            className="flex-1 p-2 text-sm rounded-md border border-input bg-background"
            disabled={isStreaming || isLoading}
          />
          
          <button
            onClick={isStreaming ? stopStream : startStream}
            disabled={(!rtspUrl.trim() && !isStreaming) || isLoading}
            className={`px-3 py-2 rounded-md text-sm ${
              isStreaming 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            } disabled:opacity-50 disabled:pointer-events-none`}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isStreaming ? (
              'Disconnect'
            ) : (
              'Connect'
            )}
          </button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Enter an RTSP URL to connect to an IP camera stream
        </p>
      </div>
    </div>
  )
} 