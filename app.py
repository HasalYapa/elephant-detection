from flask import Flask, render_template, Response, jsonify
import cv2
from ultralytics import YOLO

app = Flask(__name__)

# Load YOLOv8 model
model = YOLO("best.pt")  # Change to your trained model path
cap = cv2.VideoCapture(0)  # Use webcam

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break

        # Run YOLO detection
        results = model(frame)
        detected = False

        for result in results:
            for box in result.boxes:
                detected = True
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, "Elephant Detected", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Encode frame
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detect')
def detect():
    _, frame = cap.read()
    results = model(frame)
    detected = any(len(result.boxes) > 0 for result in results)
    return jsonify({"detected": detected})

if __name__ == "__main__":
    app.run(debug=True)
