import * as LegacyAPI from './api';
import * as NetlifyAPI from './netlify-api';
import { Detection } from '@/components/video/DetectionDisplay';

// Check if we should use Netlify Functions
const useNetlifyFunctions = process.env.NEXT_PUBLIC_USE_NETLIFY_FUNCTIONS === 'true';

// Export the appropriate API functions based on the environment
export const getAvailableModels = useNetlifyFunctions
  ? NetlifyAPI.getAvailableModels
  : LegacyAPI.getAvailableModels;

export const loadModel = useNetlifyFunctions
  ? NetlifyAPI.loadModel
  : LegacyAPI.loadModel;

// Define a fallback detectImage function for legacy API
const legacyDetectImage = async (imageData: string): Promise<Detection[]> => {
  try {
    // Use the getBackendUrl helper function from the legacy API
    const backendUrl = LegacyAPI.getBackendUrl();

    const response = await fetch(`${backendUrl}/api/detect-frame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        frame: imageData
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.detections || [];
  } catch (error) {
    console.error('Error detecting image:', error);
    return [];
  }
};

export const detectImage = useNetlifyFunctions
  ? NetlifyAPI.detectImage
  : legacyDetectImage;

export const checkBackendStatus = useNetlifyFunctions
  ? NetlifyAPI.checkBackendStatus
  : LegacyAPI.checkBackendStatus;

// For WebSocket functionality, we need to handle differently
export const initDetectionSocket = !useNetlifyFunctions
  ? LegacyAPI.initDetectionSocket
  : () => {
      console.log('WebSockets not supported with Netlify Functions, using polling instead');
      return { socket: null, connected: false };
    };

export const sendFrameForDetection = !useNetlifyFunctions
  ? LegacyAPI.sendFrameForDetection
  : async (frame: string, callback: (detections: Detection[]) => void) => {
      // Use the REST API instead of WebSockets
      try {
        const detections = await NetlifyAPI.detectImage(frame);
        callback(detections);
        return true;
      } catch (error) {
        console.error('Error in sendFrameForDetection:', error);
        return false;
      }
    };

export const forceReconnect = !useNetlifyFunctions
  ? LegacyAPI.forceReconnect
  : () => {
      console.log('WebSockets not supported with Netlify Functions');
      return false;
    };

export const checkConnectionAlive = !useNetlifyFunctions
  ? LegacyAPI.checkConnectionAlive
  : () => true;

// Export other types and functions from the legacy API for compatibility
export type { ElephantNotification } from './api';

// Export notification functions
export const initNotificationSocket = !useNetlifyFunctions
  ? LegacyAPI.initNotificationSocket
  : (onNotification: any, onConnectionChange: any) => {
      console.log('WebSockets not supported with Netlify Functions, using polling for notifications');
      // Return a mock implementation
      return {
        connected: true
      };
    };

export const disconnectNotificationSocket = !useNetlifyFunctions
  ? LegacyAPI.disconnectNotificationSocket
  : () => {
      console.log('WebSockets not supported with Netlify Functions');
    };
