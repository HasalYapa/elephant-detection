# Elephant Detection Backend

This backend service uses FastAPI and YOLOv8 for real-time elephant detection via WebSockets and HTTP endpoints.

## 🚀 Quick Start (Windows)

1. **Start the server:**
   - Double-click `start_server.bat`
   - The server will start on http://localhost:8000

2. **Open in browser:**
   - API documentation available at http://localhost:8000/docs

## 📋 Requirements

- Python 3.8 or higher
- Required packages:
  - fastapi
  - uvicorn
  - ultralytics (YOLOv8)
  - opencv-python
  - numpy

## 🛠️ Manual Installation

1. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On Linux/Mac
   source venv/bin/activate
   ```

2. **Install required packages:**
   ```bash
   pip install fastapi uvicorn ultralytics opencv-python numpy
   ```

## 🔍 YOLOv8 Model Setup

1. **Place your model files in the `models` directory:**
   - The server will look for `.pt` model files here
   - Default models that will be loaded automatically:
     - `best.pt` (your custom trained model)
     - `yolov8n.pt` (fallback model)

2. **No models? Get a pre-trained one:**
   ```bash
   # Download a pre-trained YOLOv8 model
   python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
   # Move it to the models directory
   move yolov8n.pt models/
   ```

## 🚀 Running the Backend

1. **Start the server manually:**
   ```bash
   # From the project directory
   python model_server.py
   ```

2. **Configure the port (if needed):**
   - Edit `model_server.py` and change the port in the last line:
   ```python
   uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/models` | GET | List available models |
| `/api/models/load` | POST | Load a specific model |
| `/api/models/upload` | POST | Upload a new model file |
| `/api/detect-frame` | POST | Process a single image |
| `/ws/detect` | WebSocket | Real-time detection stream |

## 🔄 WebSocket Usage

Connect to the WebSocket endpoint and send base64-encoded images:

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/detect");

ws.onopen = () => {
  console.log("Connected to detection server");
  
  // Send a frame from canvas or video element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const frame = canvas.toDataURL("image/jpeg").split(",")[1];
  ws.send(frame);
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Detections:", data.detections);
  
  // Process detections - normalized bbox format [x1, y1, x2, y2]
  data.detections.forEach(det => {
    const [x1, y1, x2, y2] = det.bbox;
    const className = det.class;
    const confidence = det.confidence;
    
    // Display bounding box on canvas
    // ...
  });
};
```

## 📊 Detection Data Format

The server returns detections in a consistent format:

```json
{
  "detections": [
    {
      "class": "elephant",
      "confidence": 0.87,
      "bbox": [0.2, 0.3, 0.6, 0.6]
    }
  ],
  "image_width": 640,
  "image_height": 480
}
```

- `bbox` coordinates are **always normalized** (0-1 range)
- Format is `[x1, y1, x2, y2]` representing top-left and bottom-right corners
- Image dimensions are included for reference

## 🔧 Troubleshooting

1. **"Model not found" error**
   - Make sure your `.pt` files are in the `models` directory
   - Check file permissions

2. **"Failed to load model" error**
   - Ensure you have the correct YOLOv8 model format
   - Try using a standard YOLOv8 model first to verify your setup

3. **Connection issues**
   - Verify that port 8000 is not blocked by firewall
   - Check if another application is using the same port

4. **Poor detection results**
   - Try using a different model (larger models are more accurate)
   - Ensure your images are clear and well-lit 