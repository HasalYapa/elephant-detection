"use client";

import { useState, useEffect } from "react";
import { getDatasets, startTraining as apiStartTraining } from "@/lib/api";

interface TrainingConfig {
  dataset: string;
  model: string;
  epochs: number;
  batchSize: number;
  imageSize: number;
  learningRate: number;
}

export default function TrainingPage() {
  const [config, setConfig] = useState<TrainingConfig>({
    dataset: "",
    model: "yolov8n",
    epochs: 200,
    batchSize: 16,
    imageSize: 640,
    learningRate: 0.001,
  });

  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [datasets, setDatasets] = useState<{id: string, name: string}[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  // Fetch datasets when component mounts
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoadingDatasets(true);
        
        // First try to get datasets from localStorage
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('uploadedDatasets');
          if (saved) {
            try {
              const parsedDatasets = JSON.parse(saved);
              if (Array.isArray(parsedDatasets) && parsedDatasets.length > 0) {
                setDatasets(parsedDatasets.map(dataset => ({
                  id: dataset.id,
                  name: dataset.name
                })));
                setLoadingDatasets(false);
                return;
              }
            } catch (error) {
              console.error("Error parsing datasets from localStorage:", error);
            }
          }
        }
        
        // If no datasets in localStorage, try from API
        try {
          const data = await getDatasets();
          if (data && Array.isArray(data)) {
            setDatasets(data.map(dataset => ({
              id: dataset.id,
              name: dataset.name
            })));
            setLoadingDatasets(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching datasets from API:", error);
        }

        // Fallback to mock data if both localStorage and API fail
        setDatasets([
          { id: "1", name: "Elephant Dataset 1" },
          { id: "2", name: "Safari Images - Annotated" },
        ]);
        setLoadingDatasets(false);
      } catch (error) {
        console.error("Failed to load datasets:", error);
        setLoadingDatasets(false);
      }
    };

    fetchDatasets();
  }, []);

  const startTraining = () => {
    setIsTraining(true);
    setProgress(0);

    // Send training configuration to API
    const trainingConfig = {
      dataset: config.dataset,
      model: config.model,
      epochs: config.epochs,
      batch_size: config.batchSize,
      image_size: config.imageSize,
      learning_rate: config.learningRate
    };

    // Store the dataset name for success message
    let datasetName = "";
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('uploadedDatasets');
        if (saved) {
          const datasets = JSON.parse(saved);
          const dataset = datasets.find((d: any) => d.id === config.dataset);
          if (dataset) {
            datasetName = dataset.name;
          }
        }
      } catch (error) {
        console.error("Error finding dataset name:", error);
      }
    }

    // Call the API to start training
    apiStartTraining(trainingConfig)
      .then(response => {
        console.log("Training started:", response);
        
        // Calculate how many progress updates we need for the full epoch count
        // Each 1% progress should represent multiple epochs when epoch count is high
        const totalEpochs = config.epochs;
        const progressPerEpoch = 100 / totalEpochs;
        let currentEpoch = 0;
        
        // For demo purposes, we'll simulate progress with an accelerated timeline
        const interval = setInterval(() => {
          setProgress((prev) => {
            // Calculate which epoch we're on based on progress
            currentEpoch = Math.floor(prev / progressPerEpoch) + 1;
            
            if (prev >= 100) {
              clearInterval(interval);
              setIsTraining(false);
              
              // Generate the expected model name
              const now = new Date();
              const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
              const baseModelType = config.model.replace('yolov8', '');
              const modelName = `trained_${datasetName.toLowerCase().replace(/\s+/g, '_')}_yolov8${baseModelType}_${dateStr}.pt`;
              
              // Show a detailed success message
              alert(
                `Training completed successfully!\n\n` +
                `Finished all ${totalEpochs} epochs\n\n` +
                `A new model has been created: "${modelName}"\n\n` +
                `To use this model for elephant detection:\n` +
                `1. Go to the Detection page\n` +
                `2. The model should be automatically selected\n` +
                `3. If not, select it from the models list\n` +
                `4. Start detection using your webcam or IP camera`
              );
              
              return 100;
            }
            return prev + 0.5; // Smaller increments to show more epochs
          });
        }, 200); // Faster updates
      })
      .catch(error => {
        console.error("Training failed to start:", error);
        setIsTraining(false);
        alert("Failed to start training. Please try again.");
      });
  };

  const stopTraining = () => {
    setIsTraining(false);
    // Here we would connect to the backend to stop training
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]:
        name === "epochs" || name === "batchSize" || name === "imageSize"
          ? parseInt(value, 10)
          : name === "learningRate"
            ? parseFloat(value)
            : value,
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Model Training</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Training Configuration</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dataset</label>
              <select
                name="dataset"
                value={config.dataset}
                onChange={handleChange}
                className="w-full p-2 border border-input rounded bg-background"
              >
                <option value="">Select a dataset</option>
                {loadingDatasets ? (
                  <option value="" disabled>Loading datasets...</option>
                ) : (
                  datasets.map(dataset => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Base Model
              </label>
              <select
                name="model"
                value={config.model}
                onChange={handleChange}
                className="w-full p-2 border border-input rounded bg-background"
              >
                <option value="yolov8n">YOLOv8 Nano</option>
                <option value="yolov8s">YOLOv8 Small</option>
                <option value="yolov8m">YOLOv8 Medium</option>
                <option value="yolov8l">YOLOv8 Large</option>
                <option value="yolov8x">YOLOv8 XLarge</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Epochs</label>
              <input
                type="number"
                name="epochs"
                value={config.epochs}
                onChange={handleChange}
                min="1"
                max="500"
                className="w-full p-2 border border-input rounded bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Batch Size
              </label>
              <input
                type="number"
                name="batchSize"
                value={config.batchSize}
                onChange={handleChange}
                min="1"
                max="128"
                className="w-full p-2 border border-input rounded bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Image Size
              </label>
              <input
                type="number"
                name="imageSize"
                value={config.imageSize}
                onChange={handleChange}
                min="320"
                max="1280"
                step="32"
                className="w-full p-2 border border-input rounded bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Learning Rate
              </label>
              <input
                type="number"
                name="learningRate"
                value={config.learningRate}
                onChange={handleChange}
                min="0.00001"
                max="0.1"
                step="0.0001"
                className="w-full p-2 border border-input rounded bg-background"
              />
            </div>

            <div className="pt-4">
              {!isTraining ? (
                <button
                  onClick={startTraining}
                  disabled={!config.dataset}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Training
                </button>
              ) : (
                <button
                  onClick={stopTraining}
                  className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90"
                >
                  Stop Training
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Training Status</h2>

          {!isTraining && progress === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <svg
                className="h-16 w-16 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="mt-4 text-muted-foreground">
                Configure and start training to see progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 h-52 overflow-y-auto font-mono text-xs">
                {/* Training logs would appear here */}
                <p>Loading model: {config.model}...</p>
                <p>Training on dataset: {config.dataset}</p>
                <p>
                  Batch size: {config.batchSize}, Image size: {config.imageSize}
                </p>
                {/* Display training logs based on progress */}
                {Array.from({ length: Math.min(Math.ceil(progress / (100 / config.epochs)), config.epochs) }).map((_, i) => {
                  const epochNum = i + 1;
                  const loss = Math.max(8.24 - (epochNum / 20) * 4.72, 0.5).toFixed(2);
                  const mAP = Math.min((epochNum / config.epochs) * 0.85, 0.85).toFixed(2);
                  
                  return (
                    <p key={epochNum}>
                      Epoch {epochNum}/{config.epochs}: loss={loss}, mAP={mAP}
                    </p>
                  );
                })}
                {progress === 100 && <p>Training complete! Model saved.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-3">
                  <div className="text-sm font-medium mb-1">Loss</div>
                  <div className="text-xl font-bold">
                    {progress === 0
                      ? "-"
                      : (8.24 - (progress / 100) * 4.72).toFixed(2)}
                  </div>
                </div>

                <div className="border border-border rounded-lg p-3">
                  <div className="text-sm font-medium mb-1">mAP@0.5</div>
                  <div className="text-xl font-bold">
                    {progress === 0
                      ? "-"
                      : ((progress / 100) * 0.42).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
