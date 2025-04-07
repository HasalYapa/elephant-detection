'use client'

import { useRef, useEffect, useState } from 'react'

export interface Detection {
  class: string
  confidence: number
  bbox: [number, number, number, number] // [x1, y1, x2, y2] in normalized coordinates (0-1)
}

interface DetectionDisplayProps {
  imageData: string | null
  detections: Detection[]
  width?: number
  height?: number
  showLabels?: boolean
  showConfidence?: boolean
  highlightClass?: string
  boxColor?: string
  labelBackgroundColor?: string
  labelTextColor?: string
}

export default function DetectionDisplay({
  imageData,
  detections = [],
  width = 640,
  height = 480,
  showLabels = true,
  showConfidence = true,
  highlightClass = 'elephant',
  boxColor = '#3b82f6',
  labelBackgroundColor = 'rgba(59, 130, 246, 0.8)',
  labelTextColor = '#ffffff'
}: DetectionDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fps, setFps] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [lastSecond, setLastSecond] = useState(Date.now())
  
  // Load image and draw detections
  useEffect(() => {
    if (!imageData || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return
    
    const img = new Image()
    
    img.onload = () => {
      // Calculate aspect ratio to maintain proportions
      const aspectRatio = img.width / img.height
      let drawWidth = width
      let drawHeight = height
      
      if (width / height > aspectRatio) {
        drawWidth = height * aspectRatio
      } else {
        drawHeight = width / aspectRatio
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw image centered
      const offsetX = (canvas.width - drawWidth) / 2
      const offsetY = (canvas.height - drawHeight) / 2
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      
      // Draw bounding boxes
      drawDetections(ctx, detections, offsetX, offsetY, drawWidth, drawHeight)
      
      // Update FPS counter
      updateFpsCounter()
    }
    
    img.src = imageData
  }, [imageData, detections, width, height])
  
  // Reset canvas dimensions when container size changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width
      canvasRef.current.height = height
    }
  }, [width, height])
  
  // Calculate FPS
  const updateFpsCounter = () => {
    const now = Date.now()
    setFrameCount(prev => prev + 1)
    
    if (now - lastSecond >= 1000) {
      setFps(frameCount)
      setLastSecond(now)
      setFrameCount(0)
    }
  }
  
  // Draw detection boxes and labels
  const drawDetections = (
    ctx: CanvasRenderingContext2D,
    detections: Detection[],
    offsetX: number,
    offsetY: number,
    imgWidth: number,
    imgHeight: number
  ) => {
    // Skip if no detections
    if (!detections || detections.length === 0) return;
    
    // Check for elephant detections first
    const elephantDetections = detections.filter(
      det => det.class.toLowerCase() === highlightClass.toLowerCase() && det.confidence >= 0.35
    );
    
    // Draw large indicator if elephants are detected
    if (elephantDetections.length > 0) {
      const highestConfidence = Math.max(...elephantDetections.map(d => d.confidence));
      ctx.save();
      ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
      ctx.font = 'bold 24px Arial, sans-serif';
      const alertText = `🐘 Elephant Detected! (${Math.round(highestConfidence * 100)}% confident)`;
      const textWidth = ctx.measureText(alertText).width;
      
      // Draw alert banner at the top
      ctx.fillRect(0, 0, width, 40);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(alertText, width / 2, 20);
      ctx.restore();
    }
    
    detections.forEach(detection => {
      // Ensure bbox is in the correct format
      if (!detection.bbox || detection.bbox.length !== 4) {
        console.error("Invalid bounding box format:", detection.bbox);
        return;
      }
      
      const [x1, y1, x2, y2] = detection.bbox;
      
      // Check if coordinates are valid (between 0 and 1 for normalized)
      if (x1 < 0 || y1 < 0 || x2 > 1 || y2 > 1) {
        console.warn("Detection coordinates out of range:", detection.bbox);
      }
      
      // Calculate pixel coordinates within the displayed image
      const boxX = offsetX + x1 * imgWidth;
      const boxY = offsetY + y1 * imgHeight;
      const boxWidth = (x2 - x1) * imgWidth;
      const boxHeight = (y2 - y1) * imgHeight;
      
      // Skip if box is invalid
      if (boxWidth <= 0 || boxHeight <= 0) return;
      
      // Highlight elephants with thicker border
      const isHighlighted = detection.class.toLowerCase() === highlightClass.toLowerCase();
      const lineWidth = isHighlighted ? 3 : 2;
      
      // Adjust color based on class
      let color = boxColor;
      if (isHighlighted) {
        color = '#ff6b6b'; // Reddish
      } else if (detection.class.toLowerCase() === 'person' || detection.class.toLowerCase() === 'human') {
        color = '#51cf66'; // Greenish
      } else if (detection.class.toLowerCase() === 'vehicle' || detection.class.toLowerCase() === 'car') {
        color = '#339af0'; // Blueish
      }
      
      // Draw bounding box
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      
      // Add colored background corners for aesthetics
      ctx.fillStyle = color;
      const cornerSize = 6;
      
      // Top-left corner
      ctx.fillRect(boxX, boxY, cornerSize, lineWidth);
      ctx.fillRect(boxX, boxY, lineWidth, cornerSize);
      
      // Top-right corner
      ctx.fillRect(boxX + boxWidth - cornerSize, boxY, cornerSize, lineWidth);
      ctx.fillRect(boxX + boxWidth - lineWidth, boxY, lineWidth, cornerSize);
      
      // Bottom-left corner
      ctx.fillRect(boxX, boxY + boxHeight - lineWidth, cornerSize, lineWidth);
      ctx.fillRect(boxX, boxY + boxHeight - cornerSize, lineWidth, cornerSize);
      
      // Bottom-right corner
      ctx.fillRect(boxX + boxWidth - cornerSize, boxY + boxHeight - lineWidth, cornerSize, lineWidth);
      ctx.fillRect(boxX + boxWidth - lineWidth, boxY + boxHeight - cornerSize, lineWidth, cornerSize);
      
      // Draw label if enabled
      if (showLabels) {
        const confidencePercentage = Math.round(detection.confidence * 100);
        const label = showConfidence
          ? `${detection.class} ${confidencePercentage}%`
          : detection.class
          
        // Skip labeling low confidence detections
        if (detection.confidence < 0.3) return;
        
        // Text formatting
        const fontSize = 12;
        ctx.font = `${fontSize}px Arial, sans-serif`;
        const textWidth = ctx.measureText(label).width;
        const textHeight = fontSize;
        const padding = 4;
        
        // Use the same color as the box for the label background
        ctx.fillStyle = color + 'cc'; // Add transparency
        ctx.fillRect(
          boxX - 1,
          boxY - textHeight - padding * 2,
          textWidth + padding * 2,
          textHeight + padding * 2
        );
        
        // Draw label text
        ctx.fillStyle = labelTextColor;
        ctx.fillText(label, boxX + padding - 1, boxY - padding - 1);
      }
    });
  };
  
  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="w-full h-full object-contain"
      />
      
      {/* FPS counter */}
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {fps} FPS
      </div>
      
      {/* Detection count */}
      {detections.length > 0 && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {detections.filter(d => d.class.toLowerCase() === highlightClass.toLowerCase()).length} {highlightClass}(s) detected
        </div>
      )}
      
      {/* Display empty state */}
      {!imageData && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">No video feed</p>
        </div>
      )}
      
      {/* Detection summary panel */}
      {detections.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs p-2 rounded max-w-[200px]">
          <div className="font-semibold mb-1">Detections ({detections.length}):</div>
          <ul className="space-y-1">
            {/* Group detections by class and count them */}
            {Object.entries(
              detections.reduce((acc: Record<string, {count: number, avgConf: number}>, det) => {
                if (!acc[det.class]) {
                  acc[det.class] = { count: 0, avgConf: 0 };
                }
                acc[det.class].count += 1;
                acc[det.class].avgConf += det.confidence;
                return acc;
              }, {})
            ).map(([className, data]) => {
              const avgConfidence = data.avgConf / data.count;
              return (
                <li key={className} className="flex justify-between">
                  <span>
                    {className} ({data.count})
                  </span>
                  <span className={
                    avgConfidence > 0.7 ? 'text-green-400' : 
                    avgConfidence > 0.5 ? 'text-yellow-400' : 
                    'text-red-400'
                  }>
                    {Math.round(avgConfidence * 100)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  )
}