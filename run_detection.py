import cv2
import requests
import winsound  # For Windows beep sound
import time
from ultralytics import YOLO

# --- Configuration ---
MODEL_PATH = "src/backend-example/models/yolov8n.pt"  # Use the yolov8n model
WEBCAM_INDEX = 0  # 0 for default internal webcam
DETECTION_CLASS_ID = 0  # Assuming class ID 0 is for 'elephant'
BEEP_FREQUENCY = 1000  # Hz
BEEP_DURATION = 1000  # milliseconds
BACKEND_URL = "http://localhost:8000/notification" # Default backend URL
COOLDOWN_PERIOD = 5 # Seconds between notifications/beeps for continuous detection

# --- Initialization ---
try:
    model = YOLO(MODEL_PATH)
    print(f"Successfully loaded model from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

cap = cv2.VideoCapture(WEBCAM_INDEX)
if not cap.isOpened():
    print(f"Error: Could not open webcam index {WEBCAM_INDEX}")
    exit()

print("Webcam opened successfully. Press 'q' to quit.")

last_notification_time = 0

# --- Main Loop ---
while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to capture frame.")
        break

    # Perform detection
    try:
        results = model(frame, verbose=False) # verbose=False to reduce console spam
    except Exception as e:
        print(f"Error during model inference: {e}")
        continue # Skip this frame

    detected = False
    # Process results
    for r in results:
        for box in r.boxes:
            if int(box.cls[0]) == DETECTION_CLASS_ID:
                detected = True
                # Draw bounding box (optional)
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = box.conf[0]
                label = f"{model.names[int(box.cls[0])]} {conf:.2f}"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                # No need to check further boxes if one elephant is found
                break
        if detected:
            break # Exit outer loop too if detected

    # Actions on detection
    current_time = time.time()
    if detected and (current_time - last_notification_time > COOLDOWN_PERIOD):
        print("Elephant Detected!")
        last_notification_time = current_time

        # 1. Trigger beep sound
        try:
            winsound.Beep(BEEP_FREQUENCY, BEEP_DURATION)
        except Exception as e:
            print(f"Error playing beep sound: {e}")

        # 2. Send notification to dashboard
        try:
            payload = {"message": f"Elephant Detected at {time.strftime('%Y-%m-%d %H:%M:%S')}"}
            response = requests.post(BACKEND_URL, data=payload)
            response.raise_for_status() # Raise an exception for bad status codes
            print(f"Notification sent to backend. Status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"Error sending notification to backend: {e}")
        except Exception as e:
            print(f"An unexpected error occurred sending notification: {e}")


    # Display the webcam feed
    cv2.imshow("Elephant Detection Feed (Press 'q' to quit)", frame)

    # Exit condition
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("Exiting...")
        break

# --- Cleanup ---
cap.release()
cv2.destroyAllWindows()
print("Resources released.")
