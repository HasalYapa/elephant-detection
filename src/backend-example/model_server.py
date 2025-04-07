"""
FastAPI Backend Example for Elephant Detection

This file demonstrates how to set up a FastAPI backend that:
1. Loads YOLOv8 models
2. Exposes API endpoints to get available models and load models
3. Provides a detection endpoint for image processing
4. Sets up a WebSocket for real-time video frame detection

Requirements:
- ultralytics
- fastapi
- python-multipart
- uvicorn
- websockets
- numpy
- Pillow

Run with: uvicorn model_server:app --reload
"""

import os
import base64
import uuid
import logging
import io
from io import BytesIO
from typing import List, Dict, Any, Optional
import re

import numpy as np
from PIL import Image
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Body, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import cv2
import json
import uvicorn
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("elephant-detection-api")

# Define models directory - change this to your models path
MODELS_DIR = "./models"
os.makedirs(MODELS_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(title="Elephant Detection API", 
             description="API for elephant detection using YOLOv8")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
active_model = None
active_model_name = None
connected_clients = set()

# Dictionary to store loaded models
loaded_models = {}

# Default class names for YOLOv8
DEFAULT_CLASS_NAMES = {
    0: "elephant",
    1: "person",
    2: "vehicle"
}

class ModelRequest(BaseModel):
    model_name: str


class DetectionRequest(BaseModel):
    image: str  # Base64 encoded image


class DetectionResult(BaseModel):
    class_name: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]


# Get list of available models
def get_available_models() -> List[str]:
    """Return a list of .pt files in the models directory"""
    if not os.path.exists(MODELS_DIR):
        return []
    
    return [f for f in os.listdir(MODELS_DIR) if f.endswith(".pt")]


# Load a model by name
def load_model(model_name: str) -> bool:
    """Load a YOLOv8 model by name"""
    global active_model, active_model_name
    
    if YOLO is None:
        logger.error("YOLO module not available. Please install ultralytics.")
        return False
    
    model_path = os.path.join(MODELS_DIR, model_name)
    
    # Check if model exists in the models directory
    if not os.path.exists(model_path):
        # Try finding it in the current directory
        if os.path.exists(model_name):
            model_path = model_name
            logger.info(f"Found model in current directory: {model_name}")
        else:
            logger.error(f"Model not found at {model_path} or current directory")
            return False
    
    try:
        logger.info(f"Loading model: {model_path}")
        model = YOLO(model_path)
        
        # Test the model with a tiny blank image to ensure it's working
        try:
            test_image = np.zeros((640, 640, 3), dtype=np.uint8)
            test_result = model(test_image, verbose=False)
            logger.info(f"Model test successful: detected {len(test_result[0].boxes)} objects")
        except Exception as test_err:
            logger.error(f"Model test failed: {str(test_err)}")
            return False
        
        # Store the model in the loaded_models dictionary
        loaded_models[model_name] = model
        active_model = model_name
        active_model_name = model_name
        logger.info(f"Model {model_name} loaded and activated successfully")
        return True
    except Exception as e:
        logger.error(f"Error loading model {model_name}: {str(e)}")
        return False


# Process an image for object detection
def process_image(image_data: str) -> Dict[str, Any]:
    """Run detection on a base64 encoded image"""
    global active_model, active_model_name
    
    if active_model is None or active_model not in loaded_models:
        logger.error("No active model available for detection")
        return {"error": "No model loaded"}
    
    try:
        # Get the model
        model = loaded_models[active_model]
        
        # Decode base64 image
        if "base64," in image_data:
            image_bytes = base64.b64decode(image_data.split(",")[-1])
        else:
            image_bytes = base64.b64decode(image_data)
            
        # Convert to numpy array and use OpenCV to decode
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            logger.error("Failed to decode image")
            return {"error": "Failed to decode image"}
            
        height, width, _ = img.shape
        
        # Run inference
        results = model(img, verbose=False)
        
        # Process results
        detections = []
        for r in results:
            boxes = r.boxes
            for i, box in enumerate(boxes):
                try:
                    # Get coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()  # Get pixel coordinates
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])
                    
                    # Get class name
                    class_name = r.names.get(class_id, DEFAULT_CLASS_NAMES.get(class_id, "unknown"))
                    
                    # Normalize coordinates
                    normalized_bbox = [
                        x1 / width,
                        y1 / height,
                        x2 / width,
                        y2 / height
                    ]
                    
                    detections.append({
                        "class": class_name,
                        "confidence": confidence,
                        "bbox": normalized_bbox
                    })
                except Exception as box_err:
                    logger.error(f"Error processing detection box: {str(box_err)}")
        
        logger.info(f"Processed image with {len(detections)} detections")
        return {
            "detections": detections,
            "model": active_model_name,
            "image_width": width,
            "image_height": height
        }
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {"error": str(e)}


@app.get("/")
async def root():
    """Root endpoint - check if API is running"""
    return {
        "status": "running",
        "active_model": active_model_name,
        "available_models": get_available_models()
    }


@app.get("/ws/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "active_model": active_model_name}


@app.get("/api/models")
async def get_models():
    """Get all available models"""
    try:
        model_files = [f for f in os.listdir(MODELS_DIR) if f.endswith('.pt')]
        return {"models": model_files}
    except Exception as e:
        logger.error(f"Error getting models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get models: {str(e)}")


@app.post("/api/models/load")
async def load_model_endpoint(request: ModelRequest):
    """Load a specific model"""
    success = load_model(request.model_name)
    if success:
        return {"success": True, "message": f"Model {request.model_name} loaded successfully"}
    else:
        return {"success": False, "message": f"Failed to load model {request.model_name}"}


@app.post("/api/detect")
async def detect(request: DetectionRequest):
    """Run detection on a single image"""
    if active_model is None:
        # Try to load a default model if available
        models = get_available_models()
        if models:
            load_model(models[0])
        else:
            return {"error": "No models available"}
    
    results = process_image(request.image)
    return results


@app.websocket("/ws/detect")
async def detect_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time detection"""
    global active_model, active_model_name, loaded_models
    
    await websocket.accept()
    connected_clients.add(websocket)
    
    try:
        # Check if active_model is properly loaded
        if active_model is None or active_model not in loaded_models:
            # Try to load a default model if available
            default_models = ["best.pt", "elephant_detector_v1.pt", "yolov8n.pt", "yolov8s.pt"]
            for model_name in default_models:
                model_path = os.path.join(MODELS_DIR, model_name)
                if os.path.exists(model_path):
                    try:
                        success = load_model(model_name)
                        if success:
                            logger.info(f"Loaded default model: {model_name}")
                            break
                    except Exception as e:
                        logger.error(f"Failed to load default model {model_name}: {e}")
            
            if active_model is None or active_model not in loaded_models:
                await websocket.send_json({"error": "No model loaded and no default model available"})
                return
        
        logger.info("WebSocket connection established")
        
        # Handle ping messages
        ping_time = time.time()
        
        while True:
            # Receive the next message
            data = await websocket.receive_text()
            current_time = time.time()
            
            # Check if it's a ping message
            if data.startswith('{"type":"ping"'):
                # Respond with a pong
                await websocket.send_text("pong")
                ping_time = current_time
                continue
            
            # Handle regular data (Base64 encoded image)
            try:
                # Make sure it's a valid Base64 string
                try:
                    # Try to fix padding
                    padding = len(data) % 4
                    if padding:
                        data += '=' * (4 - padding)
                    
                    # Clean the Base64 string for any invalid characters
                    data = re.sub(r'[^A-Za-z0-9+/=]', '', data)
                    
                    # Decode base64 image
                    img_bytes = base64.b64decode(data)
                except Exception as e:
                    logger.error(f"Base64 decoding error: {e}")
                    await websocket.send_json({"error": "Invalid Base64 data"})
                    continue
                
                # Skip processing if we've received another frame too quickly
                if current_time - ping_time < 0.01:  # 10ms
                    continue
                
                if len(img_bytes) < 1000:
                    # Image data too small, probably invalid
                    logger.warning(f"Skipping too small image data: {len(img_bytes)} bytes")
                    continue
                
                # Convert to numpy array and then to OpenCV format
                try:
                    nparr = np.frombuffer(img_bytes, np.uint8)
                    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if img_cv is None or img_cv.size == 0:
                        logger.warning("Decoded image is empty")
                        continue
                    
                    # Get image dimensions
                    img_height, img_width = img_cv.shape[:2]
                except Exception as e:
                    logger.error(f"Error processing image: {e}")
                    continue
                
                # Run detection with the active model
                model = loaded_models[active_model]
                results = model(img_cv)
                
                # Process results
                detections = []
                elephant_detected = False
                highest_elephant_confidence = 0
                
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        confidence = float(box.conf[0])
                        class_id = int(box.cls[0])
                        class_name = r.names.get(class_id, DEFAULT_CLASS_NAMES.get(class_id, "unknown"))
                        
                        # Check if this is an elephant with good confidence
                        if class_name.lower() == 'elephant' and confidence >= 0.35:  # Lower threshold for testing
                            elephant_detected = True
                            highest_elephant_confidence = max(highest_elephant_confidence, confidence)
                        
                        detections.append({
                            "class": class_name,
                            "confidence": confidence,
                            "bbox": [float(x1), float(y1), float(x2), float(y2)]
                        })
                
                # Prepare response data
                response_data = {
                    "detections": detections,
                    "image_width": img_width,
                    "image_height": img_height
                }
                
                # Add alert information if an elephant was detected
                if elephant_detected:
                    # Create a small base64 snapshot of the current frame for the notification
                    # Scale down the image for bandwidth efficiency
                    scale_factor = 0.4  # 40% of original size
                    small_img = cv2.resize(
                        img_cv, 
                        (0, 0), 
                        fx=scale_factor, 
                        fy=scale_factor
                    )
                    
                    # Encode as JPEG with compression
                    _, buffer = cv2.imencode('.jpg', small_img, [cv2.IMWRITE_JPEG_QUALITY, 70])
                    img_str = base64.b64encode(buffer).decode('utf-8')
                    
                    # Add the alert and image to the response
                    response_data["alert"] = "Elephant detected!"
                    response_data["highestConfidence"] = highest_elephant_confidence
                    response_data["imageSnapshot"] = f"data:image/jpeg;base64,{img_str}"
                
                # Send back detections along with image dimensions for normalization
                await websocket.send_json(response_data)
                
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await websocket.send_json({"error": str(e)})
    
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed")
        if websocket in connected_clients:
            connected_clients.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in connected_clients:
            connected_clients.remove(websocket)


@app.get("/api/status")
async def status():
    """Get backend status"""
    return {
        "status": "running",
        "active_model": active_model_name,
        "clients_connected": len(connected_clients),
        "available_models": get_available_models()
    }


# Load a default model on startup if available
@app.on_event("startup")
async def startup_event():
    """Try to load a model on startup"""
    global active_model, active_model_name
    
    # First check if a model is already loaded
    if active_model is not None and active_model in loaded_models:
        logger.info(f"Model already loaded: {active_model}")
        return
    
    # Search for models in priority order
    priority_models = ["best.pt", "yolov8n.pt", "yolov8s.pt", "yolov8m.pt"]
    
    # First check models directory
    for model_name in priority_models:
        model_path = os.path.join(MODELS_DIR, model_name)
        if os.path.exists(model_path):
            logger.info(f"Found model in models directory: {model_name}")
            success = load_model(model_name)
            if success:
                logger.info(f"Successfully loaded model: {model_name}")
                return
            else:
                logger.warning(f"Failed to load model: {model_name}")
    
    # Then check current directory
    for model_name in priority_models:
        if os.path.exists(model_name):
            logger.info(f"Found model in current directory: {model_name}")
            success = load_model(model_name)
            if success:
                logger.info(f"Successfully loaded model: {model_name}")
                return
            else:
                logger.warning(f"Failed to load model: {model_name}")
    
    # Finally, check for any .pt file in models directory
    models = get_available_models()
    if models:
        logger.info(f"Found models: {models}")
        success = load_model(models[0])
        if success:
            logger.info(f"Successfully loaded model: {models[0]}")
            return
        else:
            logger.warning(f"Failed to load model: {models[0]}")
    
    logger.warning("No models found or all model loading attempts failed")


# HTTP endpoint for single image detection
@app.post("/api/detect-frame")
async def detect_frame(frame: Dict[str, str]):
    try:
        # Get the image data
        if "frame" not in frame:
            raise HTTPException(status_code=400, detail="No frame data provided")
            
        image_data = frame["frame"]
        
        # Skip the data:image/jpeg;base64, prefix
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
        
        # Decode the base64 image
        frame_data = base64.b64decode(image_data)
        np_arr = np.frombuffer(frame_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Failed to decode image")
            
        height, width, _ = img.shape
        
        # Check if a model is loaded
        if active_model is None or active_model not in loaded_models:
            # Try to load a default model
            try:
                default_models = ["best.pt", "yolov8n.pt"]
                for model_name in default_models:
                    if os.path.exists(os.path.join(MODELS_DIR, model_name)):
                        await load_model(model_name)
                        break
                    elif os.path.exists(model_name):
                        await load_model(model_name)
                        break
            except Exception as e:
                logger.error(f"Failed to load default model: {str(e)}")
                return {"detections": []}
        
        # Run detection
        if active_model and active_model in loaded_models:
            model = loaded_models[active_model]
            results = model(img)
            
            # Process results
            detections = []
            for r in results:
                boxes = r.boxes
                for i, box in enumerate(boxes):
                    x1, y1, x2, y2 = box.xyxy[0].tolist()  # Get pixel coordinates
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])
                    
                    # Get class name
                    class_name = r.names.get(class_id, DEFAULT_CLASS_NAMES.get(class_id, "unknown"))
                    
                    # Normalize coordinates
                    normalized_bbox = [
                        x1 / width,
                        y1 / height,
                        x2 / width,
                        y2 / height
                    ]
                    
                    detections.append({
                        "class": class_name,
                        "confidence": confidence,
                        "bbox": normalized_bbox
                    })
            
            return {
                "detections": detections,
                "image_width": width,
                "image_height": height
            }
        else:
            return {"detections": []}
    except Exception as e:
        logger.error(f"Error in detect_frame: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Upload a model file
@app.post("/api/models/upload")
async def upload_model(file: UploadFile = File(...)):
    try:
        # Validate file
        if not file.filename.endswith('.pt'):
            raise HTTPException(status_code=400, detail="Only .pt model files are allowed")
        
        # Save the file
        file_path = os.path.join(MODELS_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        return {"success": True, "message": f"Model {file.filename} uploaded successfully"}
    except Exception as e:
        logger.error(f"Error uploading model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import sys
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Elephant Detection API Server")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
    args = parser.parse_args()
    
    # Try to load a default model at startup
    try:
        if os.path.exists("best.pt"):
            model = YOLO("best.pt")
            loaded_models["best.pt"] = model
            active_model = "best.pt"
            logger.info("Loaded default model: best.pt")
        elif os.path.exists("yolov8n.pt"):
            model = YOLO("yolov8n.pt")
            loaded_models["yolov8n.pt"] = model
            active_model = "yolov8n.pt"
            logger.info("Loaded default model: yolov8n.pt")
    except Exception as e:
        logger.warning(f"Could not load default model: {str(e)}")
    
    # Run the server
    logger.info(f"Starting server on port {args.port}")
    uvicorn.run(app, host="0.0.0.0", port=args.port)