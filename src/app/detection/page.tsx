'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Wifi,
  WifiOff,
  Settings,
  Info,
  Camera,
  RefreshCcw,
  BarChart2,
  Video,
  MonitorSmartphone,
  X,
  Loader2
} from 'lucide-react'

import WebcamCapture from '@/components/video/WebcamCapture'
import RtspStream from '@/components/video/RtspStream'
import DetectionDisplay, { Detection } from '@/components/video/DetectionDisplay'
import ModelsList from '@/components/models/ModelsList'
import ModelUpload from '@/components/models/ModelUpload'
import BeepSound from '@/components/audio/BeepSound'
import BeepButton from '@/components/audio/BeepButton'
// Import sound utilities
import { playSound, stopAllSounds } from '@/lib/sound'

// Import from the API adapter
import {
  initDetectionSocket,
  sendFrameForDetection,
  forceReconnect,
  checkBackendStatus,
  loadModel,
  checkConnectionAlive,
  ElephantNotification
} from '@/lib/api-adapter'

type VideoSource = 'webcam' | 'rtsp'

export default function DetectionPage() {
  const [currentFrame, setCurrentFrame] = useState<string | null>(null)
  const [detections, setDetections] = useState<Detection[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [processingFps, setProcessingFps] = useState(5)
  const [showSettings, setShowSettings] = useState(false)
  const [detectionsCount, setDetectionsCount] = useState(0)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25)
  const [showOnlyElephants, setShowOnlyElephants] = useState(false)
  const [videoSource, setVideoSource] = useState<VideoSource>('webcam')
  const [isRetrying, setIsRetrying] = useState(false)
  const [shouldBeep, setShouldBeep] = useState(false)
  const [elephantConfidence, setElephantConfidence] = useState(0)
  const connectionCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebSocket connection
  useEffect(() => {
    const connectToDetectionServer = () => {
      // Define handlers for WebSocket events
      const handleDetections = (newDetections: Detection[]) => {
        setDetections(newDetections)
        setDetectionsCount(prev => prev + 1)

        // Log the full detection results to see their structure
        console.log('Live detection results:', JSON.stringify(newDetections));

        // Check if there's an elephant detection with high confidence
        // First, try to find an elephant detection
        let elephantConfidenceValue = 0;

        // Iterate through all detections to find elephants
        for (const det of newDetections) {
          console.log('Live detection:', det);
          // Use type assertion to avoid TypeScript errors
          const anyDet = det as any;
          // Check if this is an elephant detection
          const className = (anyDet?.class || anyDet?.name || anyDet?.label || '').toLowerCase();
          console.log('Live detection - checking class name:', className);

          // Check for various possible elephant class names/IDs
          if (className === 'elephant' || className === '1' || className === 'elephant_african') {
            // Found an elephant, get its confidence
            const confidence = anyDet.confidence || anyDet.score || 0;
            console.log('Found elephant with confidence:', confidence);

            // Update the confidence value if this is higher than what we've seen so far
            if (confidence > elephantConfidenceValue) {
              elephantConfidenceValue = confidence;
            }
          }
        }

        setElephantConfidence(elephantConfidenceValue);

        const hasElephant = elephantConfidenceValue >= 0.65; // Updated threshold to 65%
        console.log('Live detection - Elephant found:', { hasElephant, confidence: elephantConfidenceValue });

        // Directly set shouldBeep based on whether we have an elephant with high confidence
        setShouldBeep(hasElephant);
        console.log('Setting shouldBeep to:', hasElephant);

        // Play the sound if we have an elephant with high confidence
        if (hasElephant) {
          // Reset beep flag after a delay to prevent continuous beeping
          setTimeout(() => setShouldBeep(false), 1000);

            // Try to play the sound using our utility function
            playSound('/beep-loud.mp3', 1.0)
              .then(() => console.log('Elephant detection sound played successfully'))
              .catch(err => {
                console.error('Failed to play elephant detection sound:', err);

                // As a last resort, try the audio element directly
                try {
                  const audioElement = document.getElementById('elephant-detection-beep') as HTMLAudioElement;
                  if (audioElement) {
                    audioElement.currentTime = 0;
                    audioElement.volume = 1.0;
                    const playPromise = audioElement.play();
                    if (playPromise !== undefined) {
                      playPromise.catch(err => {
                        console.error('Failed to play fallback audio:', err);

                        // Try playing with user interaction simulation
                        document.addEventListener('click', function playOnce() {
                          audioElement.play();
                          document.removeEventListener('click', playOnce);
                        }, { once: true });
                      });
                    }
                  }
                } catch (err) {
                  console.error('Error with fallback audio playback:', err);
                }
              });
        }
      }

      const handleConnectionChange = (status: 'connected' | 'disconnected' | 'error', message?: string) => {
        console.log(`WebSocket status: ${status}`, message)
        setIsConnected(status === 'connected')
        setConnectionError(
          status === 'error' || status === 'disconnected'
            ? message || 'Backend server is not available. Please ensure the server is running.'
            : null
        )

        // Reset retry state if we're now connected
        if (status === 'connected') {
          setIsRetrying(false)
        }
      }

      // Handle notifications (will be saved by the notifications page)
      const handleNotification = (notification: ElephantNotification) => {
        console.log('Elephant detected! Notification created:', notification)
        // The notification will be handled by the notifications page
      }

      // Initialize WebSocket connection with notification support
      initDetectionSocket(handleDetections, handleConnectionChange, handleNotification)
    }

    // Connect on mount
    connectToDetectionServer()

    // Set up connection checks
    const connectionCheckInterval = setInterval(() => {
      // Call connection alive check every 10 seconds
      if (isConnected) {
        checkConnectionAlive();
      } else {
        // Check backend status and try to reconnect if backend is available
        checkBackendStatus()
          .then(status => {
            // Handle both boolean and object return types
            const isAvailable = typeof status === 'boolean' ? status : status.ok;
            if (isAvailable) {
              console.log('Backend is available but WebSocket disconnected - attempting to reconnect')
              retryConnection()
            }
          })
          .catch(err => {
            console.error('Error checking backend status:', err)
          })
      }
    }, 10000);

    // Cleanup on unmount
    return () => {
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval)
      }
    }
  }, [isConnected])

  // Filter detections based on settings
  const filteredDetections = detections
    .filter(det => det.confidence >= confidenceThreshold)
    .filter(det => !showOnlyElephants || det.class.toLowerCase() === 'elephant')

  // Handle incoming video frames
  const handleFrame = (imageData: string) => {
    setCurrentFrame(imageData)

    // Send frame to backend for processing if connected
    if (isConnected) {
      sendFrameForDetection(imageData)
    }
  }

  // Handle model selection
  const handleModelChange = async (modelName: string) => {
    setSelectedModel(modelName)
    try {
      await loadModel(modelName)
      // Add a visual feedback that model was loaded successfully
      if (modelName.includes('trained_')) {
        // Get model details if available
        const modelDetailsJson = localStorage.getItem('modelDetails')
        if (modelDetailsJson) {
          const modelDetails = JSON.parse(modelDetailsJson)
          const modelInfo = modelDetails.find((m: any) => m.name === modelName)

          if (modelInfo) {
            // Create a more informative success message with training information
            const successMessage = `Model "${modelName}" loaded successfully.\nTrained on dataset: ${modelInfo.datasetName}\nAccuracy: ${modelInfo.accuracy.toFixed(2)}%`
            alert(successMessage)
            return
          }
        }
      }

      // Default success message if no details are available
      const successMessage = `${modelName} loaded successfully`
      alert(successMessage)
    } catch (error) {
      console.error("Failed to load model:", error)
      setConnectionError(`Failed to load model: ${modelName}`)
    }
  }

  // Automatically load trained models from localStorage on component mount
  useEffect(() => {
    const loadTrainedModels = () => {
      if (typeof window !== 'undefined') {
        const availableModelsJson = localStorage.getItem('availableModels')
        if (availableModelsJson) {
          try {
            const models = JSON.parse(availableModelsJson)
            if (Array.isArray(models) && models.length > 0) {
              // First check if best.pt model is available
              if (models.includes('best.pt')) {
                // Load best.pt model as priority
                handleModelChange('best.pt')
                return
              }

              // If best.pt not available, check for trained models
              const trainedModels = models.filter(model => model.includes('trained_'))
              if (trainedModels.length > 0) {
                // Automatically select the most recently trained model
                const mostRecentModel = trainedModels.sort().reverse()[0]
                handleModelChange(mostRecentModel)
              } else if (models.length > 0) {
                // If no trained models, select the first available model
                handleModelChange(models[0])
              }
            }
          } catch (e) {
            console.error("Error parsing models from localStorage:", e)
          }
        }
      }
    }

    // Short delay to ensure everything is loaded
    setTimeout(loadTrainedModels, 500)
  }, [])

  // Retry connection
  const retryConnection = () => {
    console.log('Retrying WebSocket connection...')
    setConnectionError(null)
    setIsRetrying(true)

    // Force reconnection
    forceReconnect()

    // Reset retrying indicator after 5 seconds if still not connected
    setTimeout(() => {
      if (!isConnected) {
        setIsRetrying(false)
      }
    }, 5000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Elephant Detection</h1>

        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <BeepButton label="Test Sound" />
            <a href="/audio-test" className="text-xs text-primary mt-1 hover:underline">Audio not working?</a>
          </div>
          {isConnected ? (
            <div className="flex items-center text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm">
              <Wifi size={16} className="mr-2" />
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-sm">
              <WifiOff size={16} className="mr-2" />
              <span>Disconnected</span>
            </div>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {connectionError && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-4 mb-6 flex items-start">
          <Info size={20} className="mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium">Connection Error</h3>
            <p className="text-sm mt-1">{connectionError}</p>
            <button
              onClick={retryConnection}
              disabled={isRetrying}
              className="mt-2 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm flex items-center"
            >
              {isRetrying ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <RefreshCcw size={14} className="mr-2" />
                  Retry Connection
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Video and Detection Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Input - Left Side */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Video Input</h2>

            {/* Source tabs */}
            <div className="flex p-1 bg-muted rounded-lg">
              <button
                onClick={() => setVideoSource('webcam')}
                className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                  videoSource === 'webcam'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Camera size={16} className="mr-2" />
                <span>Webcam</span>
              </button>
              <button
                onClick={() => setVideoSource('rtsp')}
                className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                  videoSource === 'rtsp'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Video size={16} className="mr-2" />
                <span>RTSP</span>
              </button>
            </div>
          </div>

          <div className="relative border border-border rounded-lg overflow-hidden">
            {videoSource === 'webcam' ? (
              <WebcamCapture
                onFrame={handleFrame}
                processingFps={processingFps}
                showControls={true}
              />
            ) : (
              <RtspStream onFrame={handleFrame} />
            )}

            {/* Overlay detection boxes on the video */}
            {currentFrame && (
              <DetectionDisplay
                imageData={currentFrame}
                detections={filteredDetections}
              />
            )}
          </div>
        </div>

        {/* Right Side - Settings and Detection Results */}
        <div className="space-y-6">
          {/* Settings Panel - Conditionally displayed */}
          {showSettings ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-foreground">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 rounded-md bg-muted/50 hover:bg-muted text-foreground"
                  aria-label="Close Settings"
                >
                  <Camera size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 space-y-6">
                {/* Model Selection */}
                <ModelsList
                  onSelectModel={(modelName: string) => handleModelChange(modelName)}
                  selectedModel={selectedModel}
                />

                {/* Add Upload Model component */}
                <ModelUpload
                  onUploadComplete={() => {
                    // Refresh the models list after upload
                    if (document.querySelector('.refresh-models-btn')) {
                      (document.querySelector('.refresh-models-btn') as HTMLButtonElement).click()
                    }
                  }}
                />

                {/* Confidence Threshold */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Detection Confidence Threshold</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10%</span>
                      <span>{Math.round(confidenceThreshold * 100)}%</span>
                      <span>90%</span>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Detection Filters</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="elephantsOnly"
                      checked={showOnlyElephants}
                      onChange={(e) => setShowOnlyElephants(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="elephantsOnly" className="text-sm">
                      Show only elephants
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-foreground">Detection Results</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-1.5 rounded-md bg-muted/50 hover:bg-muted text-foreground"
                    aria-label="Open Settings"
                  >
                    <Settings size={18} className="text-muted-foreground" />
                  </button>
                  <button
                    className="p-1.5 rounded-md bg-muted/50 hover:bg-muted text-foreground"
                    aria-label="Show Analytics"
                  >
                    <BarChart2 size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex items-center text-xs text-muted-foreground">
                <BarChart2 size={14} className="mr-1" />
                <span>Processed: {detectionsCount} frames</span>
              </div>

              {currentFrame ? (
                <DetectionDisplay
                  imageData={currentFrame}
                  detections={filteredDetections}
                  highlightClass="elephant"
                  showLabels={true}
                  showConfidence={true}
                />
              ) : (
                <div className="bg-muted h-80 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No video feed available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Panel at the Bottom */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm mt-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">How it works</h2>
        <p>
          This system captures frames from your webcam or IP camera and sends them to a backend server running
          YOLOv8 for real-time elephant detection. The detection results are sent back and displayed
          with bounding boxes around detected elephants.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
          <div className="flex items-center">
            <Video size={16} className="text-primary mr-2" />
            <span><strong>Video Input:</strong> Webcam or RTSP stream</span>
          </div>
          <div className="flex items-center">
            <BarChart2 size={16} className="text-primary mr-2" />
            <span><strong>Backend:</strong> FastAPI + YOLOv8</span>
          </div>
          <div className="flex items-center">
            <Wifi size={16} className="text-primary mr-2" />
            <span><strong>Communication:</strong> WebSockets</span>
          </div>
        </div>
      </div>

      {/* BeepSound component with debug enabled */}
      <BeepSound
        play={shouldBeep}
        confidenceThreshold={0.65} // Updated threshold to 65%
        confidence={elephantConfidence}
        debug={true}
      />

      {/* Debug info */}
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-md text-xs z-50">
        <p>Elephant confidence: {(elephantConfidence * 100).toFixed(1)}%</p>
        <p>Should beep: {shouldBeep ? 'Yes' : 'No'}</p>
        <button
          onClick={() => {
            setShouldBeep(true);
            setTimeout(() => setShouldBeep(false), 1000);
          }}
          className="mt-2 bg-primary text-white px-2 py-1 rounded text-xs"
        >
          Force Beep
        </button>
      </div>

      {/* Audio element as fallback */}
      <audio
        id="elephant-detection-beep"
        src="/beep-loud.mp3"
        preload="auto"
        style={{ display: 'none' }}
        controls={false}
        muted={false}
        loop={false}
      />
    </div>
  )
}