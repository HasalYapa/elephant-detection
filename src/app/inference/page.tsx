"use client";

import { useState, useRef, useEffect } from 'react'
import { Upload, FileUp, ImageIcon, X, Check, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Detection } from '@/components/video/DetectionDisplay'
import { getBackendUrl, loadModel } from '@/lib/api' // Import the helper functions
import BeepSound from '@/components/audio/BeepSound'
import BeepButton from '@/components/audio/BeepButton'
import { playSound, stopAllSounds } from '@/lib/sound' // Import the sound utilities

export default function InferencePage() {
  // Load the best.pt model when the page loads
  useEffect(() => {
    const loadBestModel = async () => {
      try {
        console.log('Loading best.pt model for inference page');
        await loadModel('best.pt');
        console.log('Successfully loaded best.pt model');
      } catch (error) {
        console.error('Failed to load best.pt model:', error);
      }
    };

    loadBestModel();
  }, []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [detections, setDetections] = useState<Detection[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldBeep, setShouldBeep] = useState(false)
  const [elephantConfidence, setElephantConfidence] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null

    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setSelectedFile(file)
      setDetections(null)
      setError(null)
    }
  }

  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const file = event.dataTransfer.files?.[0] || null

    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setSelectedFile(file)
      setDetections(null)
      setError(null)
    }
  }

  // Handle drag events
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  // Clear selected file
  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Stop any playing sounds
    try {
      // Stop the beep sound by setting shouldBeep to false
      setShouldBeep(false)
      setElephantConfidence(0)

      // Use our utility to stop all sounds
      const stoppedCount = stopAllSounds();

      console.log(`Stopped ${stoppedCount} sounds`);
    } catch (err) {
      console.error('Error stopping sounds:', err);
    }

    // Clear the image and reset state
    setSelectedFile(null)
    setPreviewUrl(null)
    setDetections(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Run inference on the selected image
  const runInference = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)
    setDetections(null) // Clear previous detections

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      // Use the getBackendUrl helper function instead of hardcoded URL
      const backendUrl = getBackendUrl();
      console.log(`Sending image to: ${backendUrl}/api/detect-frame`);

      // Convert the image to base64 for the API
      const file = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(file);
      let binaryString = '';
      uint8Array.forEach(byte => binaryString += String.fromCharCode(byte));
      const base64 = btoa(binaryString);

      const response = await fetch(`${backendUrl}/api/detect-frame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frame: `data:image/jpeg;base64,${base64}`
        })
        // The backend expects a JSON object with a 'frame' property containing base64 data
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }))
        throw new Error(`Failed to process image: ${response.status} ${errorData.detail || response.statusText}`)
      }

      const result = await response.json()
      console.log('Detection result:', result)
      // The backend returns absolute bbox coordinates [x1, y1, x2, y2]
      // The Detection type expects normalized coordinates, but we only display text results here,
      // so we can adapt the type or just use the data as is for display.
      // For simplicity, let's assume the structure matches what the list expects.
      const detectionResults = result.detections || []
      setDetections(detectionResults)

      // Log the full detection results to see their structure
      console.log('Full detection results:', JSON.stringify(detectionResults));

      // Check if there's an elephant detection with high confidence
      // First, try to find an elephant detection
      let elephantConfidenceValue = 0;

      // Iterate through all detections to find elephants
      for (const det of detectionResults) {
        console.log('Detection:', det);
        // Check if this is an elephant detection
        const className = (det?.class || det?.name || det?.label || '').toLowerCase();
        console.log('Checking class name:', className);

        // Check for various possible elephant class names/IDs
        if (className === 'elephant' || className === '1' || className === 'elephant_african') {
          // Found an elephant, get its confidence
          const confidence = det.confidence || det.score || 0;
          console.log('Found elephant with confidence:', confidence);

          // Update the confidence value if this is higher than what we've seen so far
          if (confidence > elephantConfidenceValue) {
            elephantConfidenceValue = confidence;
          }
        }
      }

      // If we're displaying detection results, also check those
      if (detections && detections.length > 0) {
        for (const det of detections) {
          // Use type assertion to avoid TypeScript errors
          const anyDet = det as any;
          const className = (anyDet?.class || anyDet?.name || anyDet?.label || '').toLowerCase();
          console.log('Checking detection class name:', className);

          // Check for various possible elephant class names/IDs
          if (className === 'elephant' || className === '1' || className === 'elephant_african') {
            const confidence = anyDet.confidence || anyDet.score || 0;
            console.log('Found elephant in detections with confidence:', confidence);

            // Update the confidence value if this is higher than what we've seen so far
            if (confidence > elephantConfidenceValue) {
              elephantConfidenceValue = confidence;
            }
          }
        }
      }

      // Update the confidence value
      setElephantConfidence(elephantConfidenceValue);

      const hasElephant = elephantConfidenceValue >= 0.65; // Updated threshold to 65%
      console.log('Elephant detection result:', { hasElephant, confidence: elephantConfidenceValue });

      // Directly set shouldBeep based on whether we have an elephant with high confidence
      setShouldBeep(hasElephant);
      console.log('Setting shouldBeep to:', hasElephant);

      // Play the sound if we have an elephant with high confidence
      if (hasElephant) {

          // Try to play the sound using our utility function
          playSound('/beep-loud.mp3', 1.0)
            .then(() => {
              console.log('Elephant detection sound played successfully');
              // Don't automatically clear the image
            })
            .catch(err => {
              console.error('Failed to play elephant detection sound:', err);

              // As a last resort, try the audio element directly
              try {
                const audioElement = document.getElementById('elephant-detection-beep') as HTMLAudioElement;
                if (audioElement) {
                  audioElement.currentTime = 0;
                  audioElement.volume = 1.0;
                  audioElement.loop = false; // Ensure the sound doesn't loop

                  const playPromise = audioElement.play();
                  if (playPromise !== undefined) {
                    playPromise
                      .then(() => {
                        console.log('Fallback audio played successfully');
                        // Don't automatically clear the image
                      })
                      .catch(err => {
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

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during inference.')
      console.error('Inference error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Inference Testing</h1>
            <p className="text-muted-foreground">
              Upload an image to test elephant detection using the trained model
            </p>
          </div>
          <div className="flex flex-col items-end">
            <BeepButton label="Test Sound" />
            <a href="/audio-test" className="text-xs text-primary mt-1 hover:underline">Audio not working?</a>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image upload section */}
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              previewUrl ? 'border-primary/40 bg-muted/30' : 'border-border hover:border-primary/40 hover:bg-muted/10'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            style={{ minHeight: '300px' }}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {previewUrl ? (
              <div className="relative w-full h-[300px]">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFile()
                  }}
                  className="absolute top-2 right-2 bg-background/80 p-1 rounded-full hover:bg-muted"
                  aria-label="Clear image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={40} className="text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center mb-1">
                  Drag & drop an image or click to browse
                </p>
                <p className="text-xs text-muted-foreground/70 text-center">
                  Supported formats: JPG, PNG, GIF
                </p>
              </>
            )}
          </div>

          {/* BeepSound component with debug enabled */}
          <BeepSound
            play={shouldBeep}
            confidenceThreshold={0.65} // Updated threshold to 65%
            confidence={elephantConfidence}
            debug={true}
          />

          {/* Debug info - more visible panel */}
          <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-md text-xs z-50">
            <h3 className="font-bold mb-1">Debug Info</h3>
            <p>Elephant confidence: {(elephantConfidence * 100).toFixed(1)}%</p>
            <p>Should beep: {shouldBeep ? 'Yes' : 'No'}</p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => {
                  setShouldBeep(true);
                  setTimeout(() => setShouldBeep(false), 1000);
                  playSound('/beep-loud.mp3', 1.0);
                }}
                className="px-2 py-1 bg-primary text-white rounded text-xs"
              >
                Force Beep
              </button>
              <button
                onClick={() => {
                  // Force update confidence to 0.8 (80%) and set shouldBeep to true
                  setElephantConfidence(0.8);
                  setShouldBeep(true);
                  console.log('Manually setting shouldBeep to true and confidence to 0.8');
                }}
                className="px-2 py-1 bg-green-600 text-white rounded text-xs"
              >
                Set 80% Conf + Beep
              </button>
            </div>
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
          <div className="flex space-x-2">
            <button
              onClick={runInference}
              disabled={!selectedFile || loading}
              className="flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileUp size={16} className="mr-2" />
                  Run Inference
                </>
              )}
            </button>

            <button
              onClick={clearFile}
              disabled={!selectedFile || loading}
              className="px-4 py-2 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:pointer-events-none"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results section */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <ImageIcon size={18} className="mr-2" />
            Detection Results
          </h2>

          {!selectedFile && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Upload an image and run inference to see results</p>
            </div>
          )}

          {selectedFile && !loading && detections === null && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Click "Run Inference" to analyze the image</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 size={40} className="animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Analyzing image...</p>
            </div>
          )}

          {detections && detections.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No objects detected in this image</p>
            </div>
          )}

          {/* Removed duplicate BeepSound component */}

          {detections && detections.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {detections.length} objects in the image
              </p>

              <ul className="space-y-2">
                {detections.map((detection, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center">
                      <Check
                        size={16}
                        className={`mr-2 ${detection.class.toLowerCase() === 'elephant' || detection.class === '1' ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <span className="font-medium">
                        {detection?.class === '1' ? 'Elephant' : detection?.class || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-sm bg-background px-2 py-1 rounded">
                      {Math.round(detection.confidence * 100)}% confidence
                    </span>
                  </li>
                ))}
              </ul>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                <p>Classes detected: {getUniqueClasses(detections).join(', ')}</p>
                <p>Average confidence: {(detections.reduce((sum, det) => sum + det.confidence, 0) / detections.length * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to get unique classes
function getUniqueClasses(detections: Detection[]): string[] {
  const classMap: Record<string, boolean> = {};
  detections.forEach(det => {
    if (det.class) {
      classMap[det.class] = true;
    }
  });
  return Object.keys(classMap);
}
