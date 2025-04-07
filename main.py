from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from ultralytics import YOLO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - elephant-detection-api - %(levelname)s - %(message)s'
)
logger = logging.getLogger("elephant-detection-api")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store the model
model = None

@app.on_event("startup")
async def startup_event():
    global model
    try:
        # Check if models directory exists
        models_dir = "./models"
        if not os.path.exists(models_dir):
            os.makedirs(models_dir)
            logger.error(f"Models directory not found. Created empty directory at {models_dir}")
            return
        
        # Find model files
        model_files = [f for f in os.listdir(models_dir) if f.endswith('.pt')]
        if not model_files:
            logger.error("No model files found in models directory")
            return
        
        # Load the first model found
        model_path = os.path.join(models_dir, model_files[0])
        logger.info(f"Found model in models directory: {model_files[0]}")
        logger.info(f"Loading model: {model_path}")
        
        # Load the YOLO model
        model = YOLO(model_path)
        
        # Test the model
        test_result = model("test_image.jpg" if os.path.exists("test_image.jpg") else None)
        detected_objects = len(test_result[0].boxes) if test_result else 0
        logger.info(f"Model test successful: detected {detected_objects} objects")
        logger.info(f"Model {model_files[0]} loaded and activated successfully")
        logger.info(f"Successfully loaded model: {model_files[0]}")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    try:
        # Check if model is loaded
        if model is None:
            return JSONResponse(
                status_code=500,
                content={"error": "Model not loaded. Please check server logs."}
            )
            
        # Read the uploaded image
        contents = await file.read()
        
        # Save the image temporarily
        temp_path = "temp_image.jpg"
        with open(temp_path, "wb") as f:
            f.write(contents)
        
        # Run detection using your model
        results = model(temp_path)
        
        # Process results
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                detection = {
                    "class": result.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "coordinates": box.xyxy[0].tolist()
                }
                detections.append(detection)
        
        return JSONResponse(content={"detections": detections})
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to process image: {str(e)}"}
        )

# Add a simple health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

# Add a root endpoint handler
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Elephant Detection API is running",
        "endpoints": [
            "/health - Check API health status",
            "/detect/image - Upload and detect elephants in an image"
        ],
        "model_loaded": model is not None
    }