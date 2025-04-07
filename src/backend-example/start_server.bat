@echo off
echo Starting Elephant Detection Backend Server...

:: Check if Python is installed
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found, please install Python 3.8 or later
    pause
    exit /b 1
)

:: Create models directory if it doesn't exist
if not exist models mkdir models

:: Check for models
echo Checking for YOLOv8 models...
set MODEL_FOUND=0
if exist models\best.pt (
    echo Found models\best.pt
    set MODEL_FOUND=1
) else if exist best.pt (
    echo Found best.pt in current directory
    set MODEL_FOUND=1
) else if exist models\yolov8n.pt (
    echo Found models\yolov8n.pt
    set MODEL_FOUND=1
) else if exist yolov8n.pt (
    echo Found yolov8n.pt in current directory
    set MODEL_FOUND=1
)

if %MODEL_FOUND% equ 0 (
    echo WARNING: No YOLOv8 model found. Please place a .pt model file in the models directory.
    echo The server will still start, but detection will not work until a model is loaded.
)

:: Check if required packages are installed
echo Checking required packages...

python -c "import fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing fastapi...
    pip install fastapi
)

python -c "import uvicorn" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing uvicorn...
    pip install uvicorn
)

python -c "import ultralytics" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing ultralytics...
    pip install ultralytics
)

python -c "import cv2" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing opencv-python...
    pip install opencv-python
)

echo Starting server on http://localhost:8080
echo WebSocket endpoint available at ws://localhost:8080/ws/detect
echo API documentation at http://localhost:8080/docs
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start the FastAPI server with debug logging
set PYTHONPATH=.
python -u model_server.py --port 8080

pause