# Elephant Detection System

A real-time elephant detection system using **YOLOv8** with **Next.js** frontend and **FastAPI** backend.

![Elephant Detection System](https://github.com/username/elephant-detection-ui/raw/main/public/screenshot.png)

## Features

- 🎥 **Real-time Video Processing**: Capture video from webcam or IP cameras (RTSP streams)
- 🐘 **Elephant Detection**: Detect elephants in real-time using YOLOv8
- 📊 **Live Visualization**: Display bounding boxes around detected elephants
- 🔄 **WebSocket Communication**: Fast, bidirectional communication between frontend and backend
- 🌙 **Dark Mode Support**: Sleek interface with both light and dark themes
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚙️ **Configurable Settings**: Adjust confidence thresholds, FPS, and more

## System Architecture

### Frontend (Next.js)
- Video capture from webcam using WebRTC
- Support for RTSP streams from IP cameras
- WebSocket communication with backend
- Real-time display of detection results

### Backend (FastAPI)
- YOLOv8 detection model for identifying elephants
- WebSocket server for real-time communication
- GPU acceleration for faster inference

## Prerequisites

- Node.js 18+
- Python 3.8+
- CUDA-compatible GPU (for optimal performance)
- Docker and Docker Compose (optional)

## Getting Started

### Installation

#### Clone the repository

```bash
git clone https://github.com/username/elephant-detection-ui.git
cd elephant-detection-ui
```

#### Option 1: Using Docker (recommended)

This method requires Docker and Docker Compose installed on your system.

```bash
# Start both frontend and backend
docker-compose up

# Access the application at http://localhost:3000
```

#### Option 2: Manual Setup

**Frontend:**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application will be available at http://localhost:3000
```

**Backend:**

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Configuration

#### Environment Variables

**Frontend (.env.local):**

```
NEXT_PUBLIC_BACKEND_URL=localhost
NEXT_PUBLIC_BACKEND_PORT=8000
NEXT_PUBLIC_BACKEND_PROTOCOL=http
```

**Backend (.env):**

```
PORT=8000
HOST=0.0.0.0
MODELS_DIR=./models
```

## Usage

1. Start both the frontend and backend servers
2. Open your browser and navigate to http://localhost:3000
3. Log in using the demo credentials (admin@example.com / password)
4. Navigate to the "Live Detection" page
5. Allow camera access when prompted
6. Adjust settings as needed (confidence threshold, FPS, etc.)
7. Start detection!

### Using with IP Cameras

1. On the "Live Detection" page, switch to the "IP Camera" tab
2. Enter the RTSP URL of your camera (format: `rtsp://username:password@ip-address:port/path`)
3. Click "Connect"
4. Once connected, the detection will start automatically

## Customizing the Detection Model

By default, the system uses a standard YOLOv8 model. For custom elephant detection:

1. Train a custom YOLOv8 model on elephant datasets
2. Save the model to `backend/models/elephant_detector.pt`
3. Restart the backend server
4. The custom model will be automatically loaded and set as the active model

## Development

### Project Structure

```
elephant-detection-ui/
├── src/                        # Frontend source code
│   ├── app/                    # Next.js app router
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── detection/          # Detection page
│   │   └── ...                 # Other pages
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── ui/                 # UI components
│   │   └── video/              # Video processing components
│   └── lib/                    # Utilities and API functions
├── backend/                    # Backend source code
│   ├── app.py                  # FastAPI application
│   ├── Dockerfile              # Backend Dockerfile
│   └── requirements.txt        # Python dependencies
├── public/                     # Static assets
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile.frontend         # Frontend Dockerfile
└── README.md                   # Project documentation
```

## Performance Considerations

- **FPS Setting**: Adjust the processing FPS based on your GPU capability
- **Resolution**: Higher resolution videos require more processing power
- **Confidence Threshold**: Higher values reduce false positives but may miss detections

## Troubleshooting

### Common Issues

- **Camera not connecting**: Check browser permissions for camera access
- **Backend connection failed**: Ensure the backend server is running and accessible
- **Low detection performance**: Lower the FPS setting or reduce video resolution

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [YOLOv8](https://github.com/ultralytics/ultralytics) by Ultralytics
- [Next.js](https://nextjs.org/) by Vercel
- [FastAPI](https://fastapi.tiangolo.com/) by Tiangolo 