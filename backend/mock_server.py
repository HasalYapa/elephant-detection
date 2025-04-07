import asyncio
import json
import random
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("mock-elephant-detection")

app = FastAPI(title="Mock Elephant Detection API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage for active connections
active_connections = []

# Available models (mock)
AVAILABLE_MODELS = ["yolov8n", "yolov8s", "elephant_detector"]
ACTIVE_MODEL = "elephant_detector"

# Classes that our mock detector can identify
CLASSES = ["elephant", "person", "car", "truck", "dog", "bird"]

# Get server status
@app.get("/status")
async def get_status():
    return {"status": "ok", "active_model": ACTIVE_MODEL}

# Get available models
@app.get("/models")
async def get_models():
    return {"models": AVAILABLE_MODELS}

# Set active model
@app.post("/models/active")
async def set_active_model(model_info: dict):
    global ACTIVE_MODEL
    if model_info["model"] not in AVAILABLE_MODELS:
        return {"status": "error", "message": f"Model '{model_info['model']}' not found"}, 404
    
    ACTIVE_MODEL = model_info["model"]
    return {"status": "ok", "active_model": ACTIVE_MODEL}

# WebSocket endpoint for real-time detection
@app.websocket("/ws/detect")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    logger.info(f"New client connected. Total connections: {len(active_connections)}")
    
    try:
        while True:
            # Receive frame
            data = await websocket.receive_text()
            json_data = json.loads(data)
            
            # Extract data
            timestamp = json_data.get("timestamp", 0)
            
            # Generate mock detections
            await asyncio.sleep(0.1)  # Simulate processing time
            detections = generate_mock_detections()
            
            # Send back to client
            await websocket.send_json({
                "detections": detections,
                "timestamp": timestamp
            })
            
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(active_connections)}")
    except Exception as e:
        logger.error(f"Error in WebSocket: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)

def generate_mock_detections():
    """Generate random mock detections for demonstration purposes"""
    # Number of detections (0-3)
    num_detections = random.choices([0, 1, 2, 3], weights=[0.2, 0.4, 0.3, 0.1])[0]
    
    detections = []
    
    # Generate elephant detections more frequently if using elephant_detector model
    elephant_bias = 0.8 if ACTIVE_MODEL == "elephant_detector" else 0.2
    
    for _ in range(num_detections):
        # Decide if this is an elephant (with bias)
        is_elephant = random.random() < elephant_bias
        
        # Class
        cls = "elephant" if is_elephant else random.choice([c for c in CLASSES if c != "elephant"])
        
        # Confidence
        confidence = random.uniform(0.5, 0.98)
        
        # Bounding box - [x1, y1, x2, y2] in normalized coordinates (0-1)
        x1 = random.uniform(0.1, 0.7)
        y1 = random.uniform(0.1, 0.7)
        width = random.uniform(0.1, 0.3)
        height = random.uniform(0.1, 0.3)
        x2 = min(x1 + width, 1.0)
        y2 = min(y1 + height, 1.0)
        
        detections.append({
            "class": cls,
            "confidence": confidence,
            "bbox": [x1, y1, x2, y2]
        })
    
    return detections

if __name__ == "__main__":
    uvicorn.run("mock_server:app", host="0.0.0.0", port=8000, reload=True) 