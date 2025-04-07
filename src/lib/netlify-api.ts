import { Detection } from '@/components/video/DetectionDisplay';

// Function to get available models
export const getAvailableModels = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/models');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

// Function to load a model
export const loadModel = async (modelName: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: modelName }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load model: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Model loaded successfully:', result);
    return true;
  } catch (error) {
    console.error('Error loading model:', error);
    return false;
  }
};

// Function to detect objects in an image
export const detectImage = async (imageData: string): Promise<Detection[]> => {
  try {
    const response = await fetch('/api/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });
    
    if (!response.ok) {
      throw new Error(`Detection API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.detections || [];
  } catch (error) {
    console.error('Error detecting image:', error);
    return [];
  }
};

// Function to check backend status
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/status');
    return response.ok;
  } catch (error) {
    console.error('Error checking backend status:', error);
    return false;
  }
};

// Function to simulate WebSocket for real-time detection
export const streamDetection = async (
  imageData: string,
  onDetection: (detections: Detection[]) => void
): Promise<void> => {
  try {
    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });
    
    if (!response.ok) {
      throw new Error(`Stream API error: ${response.status}`);
    }
    
    const result = await response.json();
    onDetection(result.detections || []);
  } catch (error) {
    console.error('Error in stream detection:', error);
    onDetection([]);
  }
};

// Polling function for continuous detection
export const startContinuousDetection = (
  getImageData: () => string,
  onDetection: (detections: Detection[]) => void,
  interval: number = 500
): { stop: () => void } => {
  let running = true;
  
  const poll = async () => {
    if (!running) return;
    
    try {
      const imageData = getImageData();
      await streamDetection(imageData, onDetection);
    } finally {
      if (running) {
        setTimeout(poll, interval);
      }
    }
  };
  
  // Start polling
  poll();
  
  // Return function to stop polling
  return {
    stop: () => {
      running = false;
    }
  };
};
