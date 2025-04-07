'use client'

import { useRef, useState, useEffect } from 'react'
import { Camera, RefreshCcw, Video, Zap } from 'lucide-react'
import BeepSound from '@/components/audio/BeepSound'
import { stopAllSounds } from '@/lib/sound' // Import from the sound utility

import { Detection } from './DetectionDisplay'

interface WebcamCaptureProps {
  onFrame: (imageData: string) => void
  processingFps?: number
  showControls?: boolean
  onDetection?: (detections: Detection[]) => void
}

export default function WebcamCapture({
  onFrame,
  processingFps = 5,
  showControls = true,
  onDetection
}: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [fps, setFps] = useState(processingFps)
  const [shouldBeep, setShouldBeep] = useState(false)
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([])

  // Frame capture interval
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isCameraActive && isDetecting) {
      interval = setInterval(() => {
        captureFrame()
      }, 1000 / fps)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCameraActive, isDetecting, fps])

  // Enumerate available camera devices
  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setAvailableCameras(videoDevices)

      // Select the first camera by default if none is selected
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId)
      }
    } catch (err) {
      console.error('Error enumerating video devices:', err)
      setError('Unable to retrieve available cameras')
    }
  }

  // Initialize by getting available cameras
  useEffect(() => {
    getAvailableCameras()
  }, [])

  // Start/stop camera stream
  const toggleCamera = async () => {
    if (isCameraActive) {
      // Stop existing stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
        setIsCameraActive(false)
        setIsDetecting(false)
        setShouldBeep(false) // Ensure beep is turned off

        // Stop any playing sounds
        try {
          const stoppedCount = stopAllSounds();
          console.log(`Stopped ${stoppedCount} sounds when camera was stopped`);
        } catch (err) {
          console.error('Error stopping sounds:', err);
        }
      }
    } else {
      await startCamera()
    }
  }

  // Start camera with selected device
  const startCamera = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!selectedCamera && availableCameras.length > 0) {
        setSelectedCamera(availableCameras[0].deviceId)
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
            setIsCameraActive(true)
            setIsDetecting(true)
          }
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Failed to access camera. Please check permissions and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Change camera source
  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId)

    // If camera is already active, restart with new camera
    if (isCameraActive) {
      // Stop current stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }

      // Start with new camera
      startCamera()
    }
  }

  // Capture frame and send to parent component
  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas && isCameraActive) {
      const context = canvas.getContext('2d')

      if (context) {
        try {
          // Match canvas dimensions to video
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Get image data as base64 string with proper quality and format
          // Using 'image/jpeg' for better performance and smaller payload
          const imageData = canvas.toDataURL('image/jpeg', 0.75)

          // Validate that the image data is properly formatted
          if (imageData && imageData.startsWith('data:image/jpeg;base64,')) {
            // Extract base64 part to check if it's valid
            const base64Data = imageData.split('base64,')[1]

            // Verify it's a valid Base64 string (basic check)
            const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)

            if (!isValidBase64) {
              console.error('Generated invalid Base64 data')
              return
            }

            // Make sure we have a reasonable payload size
            if (base64Data.length < 1000) {
              console.error('Image data too small, possibly corrupted')
              return
            }

            // Send to parent component for processing
            onFrame(imageData)

            // Handle detections if callback is provided
            if (onDetection) {
              try {
                // Update current detections with new ones
                onDetection(currentDetections)

                // Check for elephant with high confidence
                const hasElephant = currentDetections.some(
                  (det: Detection) => det.class?.toLowerCase() === 'elephant' && det.confidence >= 0.65 // Updated threshold to 65%
                )

                // Only trigger beep if we found a high-confidence elephant detection
                if (hasElephant) {
                  setShouldBeep(true)
                  // Reset beep trigger after a short delay
                  setTimeout(() => setShouldBeep(false), 1000)
                }
              } catch (err) {
                console.error('Error handling detections:', err)
              }
            }
          } else {
            console.error('Invalid image data format:',
              imageData ? `${imageData.substring(0, 20)}...` : 'empty string')
          }
        } catch (err) {
          console.error('Error capturing or encoding frame:', err)
        }
      }
    }
  }

  // Handle FPS change
  const handleFpsChange = (newFps: number) => {
    setFps(newFps)
  }

  // Toggle detection on/off
  const toggleDetection = () => {
    const newDetectingState = !isDetecting;
    setIsDetecting(newDetectingState);

    // If turning off detection, also stop any sounds
    if (!newDetectingState) {
      setShouldBeep(false); // Ensure beep is turned off

      // Stop any playing sounds
      try {
        const stoppedCount = stopAllSounds();
        console.log(`Stopped ${stoppedCount} sounds when detection was paused`);
      } catch (err) {
        console.error('Error stopping sounds:', err);
      }
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Camera display */}
      <div className="relative bg-black aspect-video flex items-center justify-center">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-10 p-4">
            <div className="text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={() => { setError(null); getAvailableCameras() }}
                className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
              <p>Connecting to camera...</p>
            </div>
          </div>
        )}

        {!isCameraActive && !isLoading && !error && (
          <div className="flex flex-col items-center text-muted-foreground">
            <Camera size={48} className="mb-2" />
            <p>Camera is not active</p>
            <button
              onClick={toggleCamera}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm"
            >
              Start Camera
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          className={`w-full h-full object-contain ${!isCameraActive ? 'hidden' : ''}`}
          muted
          playsInline
        />

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Status indicator */}
        {isCameraActive && (
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full ${isDetecting ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span className="ml-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                {isDetecting ? `Detecting (${fps} FPS)` : 'Paused'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BeepSound component */}
      <BeepSound
        play={shouldBeep}
        confidenceThreshold={0.65} // Updated threshold to 65%
        confidence={currentDetections.find((d: any) => d.class.toLowerCase() === 'elephant')?.confidence || 0}
      />

      {/* Controls */}
      {showControls && (
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleCamera}
                className={`p-2 rounded-md flex items-center space-x-1 text-sm ${
                  isCameraActive
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                disabled={isLoading}
              >
                <Video size={16} />
                <span>{isCameraActive ? 'Stop Camera' : 'Start Camera'}</span>
              </button>

              {isCameraActive && (
                <button
                  onClick={toggleDetection}
                  className={`p-2 rounded-md flex items-center space-x-1 text-sm ${
                    isDetecting
                      ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                      : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  }`}
                >
                  <Zap size={16} />
                  <span>{isDetecting ? 'Pause Detection' : 'Resume Detection'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => getAvailableCameras()}
                className="p-2 rounded-md bg-muted/50 hover:bg-muted text-foreground text-sm flex items-center"
                title="Refresh camera list"
              >
                <RefreshCcw size={16} />
              </button>

              <select
                value={selectedCamera}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="text-sm bg-muted/50 border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              >
                {availableCameras.length === 0 ? (
                  <option value="">No cameras found</option>
                ) : (
                  availableCameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 5)}...`}
                    </option>
                  ))
                )}
              </select>

              {isCameraActive && (
                <select
                  value={fps}
                  onChange={(e) => handleFpsChange(Number(e.target.value))}
                  className="text-sm bg-muted/50 border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="1">1 FPS</option>
                  <option value="2">2 FPS</option>
                  <option value="5">5 FPS</option>
                  <option value="10">10 FPS</option>
                  <option value="15">15 FPS</option>
                </select>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}