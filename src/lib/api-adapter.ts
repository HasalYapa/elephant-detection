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

export const detectImage = useNetlifyFunctions 
  ? NetlifyAPI.detectImage 
  : LegacyAPI.detectImage;

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
