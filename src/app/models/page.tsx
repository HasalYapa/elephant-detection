"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Box,
  Upload,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Download,
  BarChart2,
  Trash2,
  User,
  Calendar,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { getAvailableModels, loadModel } from "@/lib/api-adapter";
import ModelsList from "@/components/models/ModelsList";

interface ModelInfo {
  id: string;
  name: string;
  type: string;
  size: string;
  dateAdded: string;
  description: string;
  accuracy: number;
  classes: string[];
  trainedBy: string;
}

const ModelManagementPage = () => {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelInfoExpanded, setModelInfoExpanded] = useState(true);

  // Model details (mock data - in a real app this would come from the API)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  // Fetch available models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  // Update model info when a model is selected
  useEffect(() => {
    if (selectedModel) {
      // In a real app, this would fetch model details from the API
      // For now, we'll use mock data
      const mockInfo: ModelInfo = {
        id: `model-${Date.now()}`,
        name: selectedModel,
        type: selectedModel.includes("yolov8") ? "YOLO v8" : "Custom Model",
        size: `${Math.floor(Math.random() * 200) + 10} MB`,
        dateAdded: new Date().toISOString().split("T")[0],
        description: selectedModel.includes("elephant")
          ? "Custom model trained specifically for elephant detection in various environments."
          : "Pre-trained YOLO model capable of detecting 80 different object classes including elephants.",
        accuracy: Math.random() * 15 + 75, // 75-90% accuracy
        classes: selectedModel.includes("elephant")
          ? ["elephant", "human", "vehicle"]
          : ["person", "car", "truck", "elephant", "zebra", "giraffe", "..."],
        trainedBy: selectedModel.includes("elephant") ? "Your Organization" : "Ultralytics",
      };

      setModelInfo(mockInfo);
    } else {
      setModelInfo(null);
    }
  }, [selectedModel]);

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const modelList = await getAvailableModels();
      setModels(modelList);

      if (modelList.length > 0 && !selectedModel) {
        setSelectedModel(modelList[0]);
      }

      setLoadingModels(false);
    } catch (error) {
      console.error("Failed to fetch models:", error);
      setLoadingModels(false);
    }
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    loadModel(modelName).catch(err => {
      console.error("Failed to load model:", err);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setModelFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!modelFile) {
      setUploadError("Please select a model file to upload");
      return;
    }

    if (!modelFile.name.endsWith(".pt")) {
      setUploadError("Only .pt model files are supported");
      return;
    }

    try {
      setUploadingModel(true);
      setUploadProgress(0);
      setUploadError(null);

      // Simulate upload progress for demo
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);

            // Simulate api call completion after upload is done
            setTimeout(() => {
              setUploadingModel(false);
              setModelFile(null);
              fetchModels(); // Refresh the models list

              // Select the newly uploaded model
              setSelectedModel(modelFile.name);

              // Reset upload progress
              setUploadProgress(0);
            }, 500);

            return 100;
          }
          return prev + 5;
        });
      }, 200);

    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload model. Please try again.");
      setUploadingModel(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Model Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Models List */}
        <div className="space-y-6">
          <ModelsList
            onSelectModel={handleModelSelect}
            selectedModel={selectedModel || undefined}
          />

          {/* Upload Form */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-4">Upload New Model</h3>

            <form onSubmit={handleUpload}>
              {uploadError && (
                <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-4 flex items-start text-sm">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <div>{uploadError}</div>
                </div>
              )}

              <div className="mb-4">
                <div className={`border-2 border-dashed p-4 rounded-lg text-center ${
                  modelFile ? 'border-primary/50' : 'border-border'
                }`}>
                  {modelFile ? (
                    <div>
                      <p className="font-medium">{modelFile.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(modelFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setModelFile(null)}
                        className="mt-2 text-sm text-destructive hover:text-destructive/80"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop your model file (.pt) here, or click to browse
                      </p>
                      <input
                        type="file"
                        id="model-file"
                        accept=".pt"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="model-file"
                        className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm cursor-pointer"
                      >
                        Browse Files
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {uploadingModel && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!modelFile || uploadingModel}
                className="w-full bg-primary text-white py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingModel ? (
                  <span className="flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Uploading...
                  </span>
                ) : (
                  "Upload Model"
                )}
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
            <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
              <Info size={16} />
              <span>About Models</span>
            </h3>
            <p className="mb-2">
              Models are PyTorch (.pt) files that contain the neural network weights for object detection.
            </p>
            <p>
              You can use pre-trained YOLOv8 models or custom models trained specifically for
              elephant detection.
            </p>
          </div>
        </div>

        {/* Right Column: Model Details */}
        <div className="col-span-2">
          {selectedModel && modelInfo ? (
            <div className="bg-card border border-border rounded-lg p-6">
              <div
                className="flex justify-between items-start mb-4 cursor-pointer"
                onClick={() => setModelInfoExpanded(!modelInfoExpanded)}
              >
                <h2 className="text-2xl font-bold">{modelInfo.name}</h2>
                <button className="p-1 hover:bg-muted rounded-full">
                  {modelInfoExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {modelInfoExpanded && (
                <>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="bg-accent/30 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                      <Box size={16} className="mr-1.5" />
                      {modelInfo.type}
                    </div>
                    <div className="bg-accent/30 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                      <CheckCircle size={16} className="mr-1.5" />
                      {modelInfo.accuracy.toFixed(1)}% Accuracy
                    </div>
                    <div className="bg-accent/30 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                      <Info size={16} className="mr-1.5" />
                      {modelInfo.size}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">{modelInfo.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Classes</h3>
                      <div className="flex flex-wrap gap-2">
                        {modelInfo.classes.map((cls, index) => (
                          <span
                            key={index}
                            className="bg-muted px-2 py-1 rounded text-sm"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Details</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center text-sm">
                            <User size={16} className="mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">Trained by:</span>
                            <span className="ml-1 font-medium">{modelInfo.trainedBy}</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <Calendar size={16} className="mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">Added on:</span>
                            <span className="ml-1 font-medium">{modelInfo.dateAdded}</span>
                          </li>
                          <li className="flex items-center text-sm">
                            <FileText size={16} className="mr-2 text-muted-foreground" />
                            <span className="text-muted-foreground">Format:</span>
                            <span className="ml-1 font-medium">.pt (PyTorch)</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Actions</h3>
                        <div className="space-y-2">
                          <button className="w-full justify-start text-left bg-muted hover:bg-muted/80 px-4 py-2 rounded flex items-center text-sm">
                            <Download size={16} className="mr-2" />
                            Download Model
                          </button>
                          <button className="w-full justify-start text-left bg-muted hover:bg-muted/80 px-4 py-2 rounded flex items-center text-sm">
                            <BarChart2 size={16} className="mr-2" />
                            View Performance Stats
                          </button>
                          <button className="w-full justify-start text-left bg-muted hover:bg-muted/80 px-4 py-2 rounded flex items-center text-sm">
                            <MessageSquare size={16} className="mr-2" />
                            View Documentation
                          </button>
                          <button className="w-full justify-start text-left bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 rounded flex items-center text-sm">
                            <Trash2 size={16} className="mr-2" />
                            Delete Model
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="mt-8">
                      <Tabs defaultValue="overview">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="metrics">Metrics</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                          <div className="p-4 border rounded-md mt-4">
                            <h4 className="font-medium mb-2">Model Performance Overview</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              This model has been tested on various datasets and environments.
                            </p>

                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Precision</span>
                                  <span className="font-medium">{(modelInfo.accuracy * 0.95).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${modelInfo.accuracy * 0.95}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Recall</span>
                                  <span className="font-medium">{(modelInfo.accuracy * 0.9).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${modelInfo.accuracy * 0.9}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>mAP50</span>
                                  <span className="font-medium">{(modelInfo.accuracy * 1.05).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-purple-500 h-2 rounded-full"
                                    style={{ width: `${modelInfo.accuracy * 1.05}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="metrics">
                          <div className="p-4 border rounded-md mt-4">
                            <h4 className="font-medium mb-2">Detailed Metrics</h4>
                            <p className="text-sm text-muted-foreground">
                              Detailed performance metrics will be shown here in a real application.
                            </p>
                          </div>
                        </TabsContent>

                        <TabsContent value="history">
                          <div className="p-4 border rounded-md mt-4">
                            <h4 className="font-medium mb-2">Model History</h4>
                            <p className="text-sm text-muted-foreground">
                              This would show the version history and changes made to the model over time.
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center h-64">
              <Box size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Model Selected</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Select a model from the list or upload a new one to view details and metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelManagementPage;