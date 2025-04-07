import base64
import io
import json
import logging
import os
import time
from typing import Dict, List, Optional

import base64
import io
import json
import logging
import os
import time
from typing import Dict, List, Optional

import cv2
import numpy as np
# Added File and UploadFile for image upload endpoint
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import socketio # Added for WebSocket notifications
from fastapi import Form # Added for form data in notification endpoint
from typing import Annotated # Added for type hinting form data
from ultralytics import YOLO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("elephant-detection")

app = FastAPI(title="Elephant Detection API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models directory
MODELS_DIR = os.environ.get("MODELS_DIR", "./models")
os.makedirs(MODELS_DIR, exist_ok=True)

# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def send_detection(self, websocket: WebSocket, detections: List[Dict], timestamp: float):
        await websocket.send_json({
            "detections": detections,
            "timestamp": timestamp
        })


# Initialize connection manager (for direct WebSocket connections if still needed)
manager = ConnectionManager()

# Initialize Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*') # Allow all origins for simplicity
# Wrap FastAPI app with Socket.IO middleware, but mount the Socket.IO at a specific path
# This ensures FastAPI routes are still accessible
socket_app = socketio.ASGIApp(sio, app, socketio_path='socket.io')

# Available models
available_models = {}

# Active model for detection
active_model_name = None
active_model = None


# Load models when application starts
@app.on_event("startup")
async def startup_event():
    global available_models, active_model, active_model_name
    
    default_loaded = False
    try:
        # --- Load Default YOLOv8n Model ---
        default_model_path = os.path.join(MODELS_DIR, "yolov8n.pt")
        if os.path.exists(default_model_path):
            logger.info(f"Loading default model from {default_model_path}")
            yolo_default_model = YOLO(default_model_path)
            available_models["yolov8n"] = yolo_default_model
            # Set as initial active model, might be overridden below
            active_model = yolo_default_model
            active_model_name = "yolov8n"
            default_loaded = True
        else:
            logger.warning(f"Default model yolov8n.pt not found in {MODELS_DIR}. Skipping.")
            # Fallback to yolov8s if default not found
            try:
                logger.info("Attempting to use yolov8s.pt as fallback default.")
                fallback_model = YOLO("yolov8s.pt") # Assumes yolov8s.pt is in the root or accessible
                available_models["yolov8s"] = fallback_model
                active_model = fallback_model
                active_model_name = "yolov8s"
                default_loaded = True
                # Optionally save it to models dir?
                # fallback_model.save(os.path.join(MODELS_DIR, "yolov8s.pt"))
            except Exception as fallback_e:
                 logger.error(f"Could not load fallback yolov8s.pt: {fallback_e}. No default model active initially.")


        # --- Load Custom Elephant Detector (best.pt) ---
        best_model_path = os.path.join(MODELS_DIR, "best.pt")
        if os.path.exists(best_model_path):
            logger.info(f"Loading custom elephant detection model 'best.pt' from {best_model_path}")
            try:
                custom_best_model = YOLO(best_model_path)
                available_models["elephant_detector_best"] = custom_best_model
                # Set this as the active model if found
                active_model = custom_best_model
                active_model_name = "elephant_detector_best"
                logger.info(f"Set 'elephant_detector_best' as the active model.")
            except Exception as e:
                 logger.error(f"Error loading custom model 'best.pt': {e}")
        else:
             logger.info(f"Custom model 'best.pt' not found in {MODELS_DIR}. Skipping.")


        # --- Load Legacy Custom Elephant Detector (elephant_detector.pt) ---
        # Keep this for backward compatibility or alternative custom models
        legacy_custom_model_path = os.path.join(MODELS_DIR, "elephant_detector.pt")
        if os.path.exists(legacy_custom_model_path):
            # Only load if 'best.pt' wasn't loaded or if it's a different file
            if "elephant_detector_best" not in available_models or best_model_path != legacy_custom_model_path:
                logger.info(f"Loading legacy custom elephant model from {legacy_custom_model_path}")
                try:
                    legacy_custom_model = YOLO(legacy_custom_model_path)
                    available_models["elephant_detector"] = legacy_custom_model
                    # Only set active if no other model is active yet
                    if active_model is None:
                        active_model = legacy_custom_model
                        active_model_name = "elephant_detector"
                        logger.info(f"Set legacy 'elephant_detector' as the active model.")
                except Exception as e:
                    logger.error(f"Error loading legacy custom model 'elephant_detector.pt': {e}")

        if not active_model:
             logger.error("No models could be loaded successfully.")
             # Decide how to handle this - raise error, exit, or run without detection?
             # For now, let it proceed but log error. Frontend/API calls will fail.

    except Exception as e:
        logger.error(f"Critical error during model loading: {e}")
        # Depending on severity, you might want to raise the exception
        # raise

    logger.info(f"Startup complete. Available models: {list(available_models.keys())}. Active model: {active_model_name}")


# Model information schema
class ModelInfo(BaseModel):
    model: str


# Get server status
@app.get("/status")
async def get_status():
    return {"status": "ok", "active_model": active_model_name}


# Get available models
@app.get("/models")
async def get_models():
    return {"models": list(available_models.keys())}


# Set active model
@app.post("/models/active")
async def set_active_model(model_info: ModelInfo):
    global active_model, active_model_name
    
    if model_info.model not in available_models:
        raise HTTPException(status_code=404, detail=f"Model '{model_info.model}' not found")
    
    active_model = available_models[model_info.model]
    active_model_name = model_info.model
    
    return {"status": "ok", "active_model": active_model_name}


# WebSocket endpoint for real-time detection
@app.websocket("/ws/detect")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive frame as JSON with base64 encoded image
            data = await websocket.receive_text()
            json_data = json.loads(data)
            
            # Extract frame data
            frame_data = json_data.get("data")
            timestamp = json_data.get("timestamp", time.time())
            
            if not frame_data:
                continue
            
            # Decode base64 image
            img_bytes = base64.b64decode(frame_data)
            img_array = np.frombuffer(img_bytes, dtype=np.uint8)
            frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            
            # Perform detection with the active model
            if active_model:
                results = active_model(frame)
                
                # Process detection results
                detections = []
                
                for result in results:
                    boxes = result.boxes
                    
                    for i, box in enumerate(boxes):
                        # Get box coordinates (x1, y1, x2, y2)
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        
                        # Convert to normalized coordinates (0-1)
                        h, w = frame.shape[:2]
                        x1, x2 = x1 / w, x2 / w
                        y1, y2 = y1 / h, y2 / h
                        
                        # Get class and confidence
                        cls = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        
                        # Get class name
                        class_name = result.names[cls]
                        
                        # Add to detections list
                        detections.append({
                            "class": class_name,
                            "confidence": conf,
                            "bbox": [x1, y1, x2, y2]
                        })
                
                # Send detection results back to client
                await manager.send_detection(websocket, detections, timestamp)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error in WebSocket: {e}")
        manager.disconnect(websocket)


# HTTP endpoint for single image detection
@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    """
    Receives an image file via POST request, performs detection using the
    active model, and returns the detection results.
    """
    if not active_model:
        raise HTTPException(status_code=503, detail="No active model loaded")

    try:
        # Read image content
        contents = await file.read()
        img_array = np.frombuffer(contents, dtype=np.uint8)
        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Could not decode image")

        # Perform detection
        start_time = time.time()
        results = active_model(frame)
        end_time = time.time()
        logger.info(f"Image detection took {end_time - start_time:.4f} seconds")

        # Process detection results
        detections = []
        for result in results:
            boxes = result.boxes
            for i, box in enumerate(boxes):
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                h, w = frame.shape[:2]
                # Keep absolute coordinates for image detection? Or normalize?
                # Let's return absolute for now, easier to draw on original image
                # x1_norm, x2_norm = x1 / w, x2 / w
                # y1_norm, y2_norm = y1 / h, y2 / h

                cls = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                class_name = result.names[cls]

                detections.append({
                    "class": class_name,
                    "confidence": conf,
                    "bbox": [int(x1), int(y1), int(x2), int(y2)] # Return absolute pixel coordinates
                })

        return JSONResponse(content={"detections": detections})

    except Exception as e:
        logger.error(f"Error processing image detection: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


# Endpoint to receive notifications from the detection script
@app.post("/notification")
async def receive_notification(message: Annotated[str, Form()]):
    """
    Receives a notification message via POST request (form data)
    and broadcasts it to all connected Socket.IO clients.
    """
    logger.info(f"Received notification: {message}")
    # Emit the message to all connected Socket.IO clients
    await sio.emit('new-notification', {'message': message})
    return {"status": "Notification received and broadcasted"}


# Socket.IO connection event handler (optional, for logging)
@sio.event
async def connect(sid, environ):
    logger.info(f"Socket.IO client connected: {sid}")

# Socket.IO disconnection event handler (optional, for logging)
@sio.event
async def disconnect(sid):
    logger.info(f"Socket.IO client disconnected: {sid}")


# Run application if script is executed directly
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")

    # Run the combined FastAPI and Socket.IO app
    # Note: Use "app:socket_app" to run the wrapped application
    uvicorn.run("app:socket_app", host=host, port=port, reload=True)
