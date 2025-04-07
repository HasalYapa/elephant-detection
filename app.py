import os
import gradio as gr
import numpy as np
from PIL import Image
import io
import base64
import json
from ultralytics import YOLO
import cv2

# Load environment variables or set defaults
MODEL_PATH = os.environ.get("MODEL_PATH", "models/best.pt")
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.65"))

# Initialize the model
try:
    model = YOLO(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def process_image(image):
    """Process an image and return detections"""
    if model is None:
        return {"error": "Model not loaded"}
    
    # Convert to numpy array if needed
    if isinstance(image, Image.Image):
        img_array = np.array(image)
    else:
        img_array = image
        
    # Run inference
    results = model(img_array, conf=CONFIDENCE_THRESHOLD)
    
    # Process results
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = result.names[class_id]
            
            detections.append({
                "class": class_name,
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2]
            })
    
    return {"detections": detections}

def detect_image(image):
    """Gradio interface for image detection"""
    if image is None:
        return json.dumps({"error": "No image provided"})
    
    result = process_image(image)
    return json.dumps(result)

def detect_base64(base64_string):
    """Process base64 encoded image and return detections"""
    try:
        # Remove data URL prefix if present
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]
            
        # Decode base64 string
        img_bytes = base64.b64decode(base64_string)
        img = Image.open(io.BytesIO(img_bytes))
        
        # Convert to RGB if needed
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        # Process the image
        result = process_image(np.array(img))
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"error": str(e)})

# Create Gradio interface
with gr.Blocks() as demo:
    gr.Markdown("# Elephant Detection API")
    
    with gr.Tab("Image Upload"):
        with gr.Row():
            with gr.Column():
                image_input = gr.Image(type="numpy")
                image_button = gr.Button("Detect")
            with gr.Column():
                image_output = gr.JSON()
        image_button.click(detect_image, inputs=image_input, outputs=image_output)
    
    with gr.Tab("API"):
        gr.Markdown("""
        ## API Usage
        
        This Space provides two API endpoints:
        
        ### 1. /detect-image
        Upload an image file for detection.
        
        ```python
        import requests
        response = requests.post(
            "https://hasalyapa-elephant-detection-backend.hf.space/detect-image",
            files={"image": open("elephant.jpg", "rb")}
        )
        print(response.json())
        ```
        
        ### 2. /detect-base64
        Send a base64-encoded image for detection.
        
        ```python
        import requests
        import base64
        
        with open("elephant.jpg", "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode()
            
        response = requests.post(
            "https://hasalyapa-elephant-detection-backend.hf.space/detect-base64",
            json={"image": encoded_string}
        )
        print(response.json())
        ```
        """)

# Add API endpoints
demo.queue()
demo.launch()
