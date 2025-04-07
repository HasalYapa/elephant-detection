FROM nvidia/cuda:12.1.0-base-ubuntu22.04

WORKDIR /app

# Install Python and other dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create models directory
RUN mkdir -p /app/models

# Expose port
EXPOSE 8000

# Start application (using the Socket.IO wrapped app)
CMD ["uvicorn", "app:socket_app", "--host", "0.0.0.0", "--port", "8000"]
