'use client';

import { useState, useEffect } from 'react';
import { RefreshCcw, UploadCloud, Check, AlertCircle, Loader2, Star, Database } from 'lucide-react';
import { getAvailableModels, loadModel } from '@/lib/api-adapter';

interface ModelDetails {
  name: string;
  datasetName: string;
  baseModel: string;
  trainedOn: string;
  epochs: number;
  accuracy: number;
}

interface ModelsListProps {
  onSelectModel: (modelName: string) => void;
  selectedModel?: string | null;
  showUpload?: boolean;
}

export default function ModelsList({
  onSelectModel,
  selectedModel,
  showUpload = true
}: ModelsListProps) {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingModel, setLoadingModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modelDetails, setModelDetails] = useState<ModelDetails[]>([]);

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
    // Load model details from localStorage
    if (typeof window !== 'undefined') {
      const detailsJson = localStorage.getItem('modelDetails');
      if (detailsJson) {
        try {
          const details = JSON.parse(detailsJson);
          if (Array.isArray(details)) {
            setModelDetails(details);
          }
        } catch (e) {
          console.error('Failed to parse model details', e);
        }
      }
    }
  }, []);

  // Fetch available models from API
  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);

    try {
      const availableModels = await getAvailableModels();
      setModels(availableModels);

      // Auto-select first model if none selected
      if (!selectedModel && availableModels.length > 0) {
        onSelectModel(availableModels[0]);
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setError('Failed to load available models');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Format model name for display
  const formatModelName = (modelName: string) => {
    // Remove file extension
    const nameWithoutExtension = modelName.replace('.pt', '');

    // Handle trained models
    if (nameWithoutExtension.startsWith('trained_')) {
      // Try to get model details from localStorage
      try {
        const modelDetailsJson = localStorage.getItem('modelDetails');
        if (modelDetailsJson) {
          const modelDetails = JSON.parse(modelDetailsJson);
          const modelInfo = modelDetails.find((m: any) => m.name === modelName);

          if (modelInfo) {
            return `${modelInfo.datasetName} (${formatAccuracy(modelInfo.accuracy)})`;
          }
        }
      } catch (e) {
        console.error('Error parsing model details:', e);
      }

      // If no details, format based on name
      const parts = nameWithoutExtension.split('_');
      if (parts.length >= 3) {
        // Extract dataset name
        let datasetName = parts.slice(1, -1).join(' ');
        return datasetName.charAt(0).toUpperCase() + datasetName.slice(1);
      }
    }

    // Handle standard models
    switch (nameWithoutExtension) {
      case 'yolov8n':
        return 'YOLOv8 Nano';
      case 'yolov8s':
        return 'YOLOv8 Small';
      case 'yolov8m':
        return 'YOLOv8 Medium';
      case 'yolov8l':
        return 'YOLOv8 Large';
      case 'yolov8x':
        return 'YOLOv8 XLarge';
      case 'best':
        return 'Best Model (Custom Trained)';
      default:
        return nameWithoutExtension;
    }
  };

  // Format accuracy to percentage
  const formatAccuracy = (accuracy: number) => {
    return `${Math.round(accuracy)}% accuracy`;
  };

  // Handle model selection
  const handleModelSelect = async (modelName: string) => {
    if (modelName === selectedModel) return;

    try {
      setLoadingModel(modelName);
      await loadModel(modelName);

      if (onSelectModel) {
        onSelectModel(modelName);
      }

      setLoadingModel(null);
    } catch (err) {
      setError(`Failed to load model: ${modelName}`);
      setLoadingModel(null);
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-center h-32">
        <Loader2 className="animate-spin text-primary mr-2" size={20} />
        <span>Loading models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">
          Detection Model
        </label>
        <button
          onClick={fetchModels}
          disabled={loading}
          className="text-xs flex items-center text-muted-foreground hover:text-foreground refresh-models-btn"
          aria-label="Refresh models"
        >
          <RefreshCcw size={12} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-destructive text-xs mb-2">
          {error}
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        {models.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {loading ? 'Loading models...' : 'No models available'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {models.map((model) => (
              <button
                key={model}
                onClick={() => handleModelSelect(model)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between text-sm hover:bg-muted/50 transition-colors ${
                  selectedModel === model ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <div className="flex items-center">
                  <Database size={16} className="mr-2 text-muted-foreground" />
                  <span>{formatModelName(model)}</span>
                </div>
                {selectedModel === model && (
                  <Check size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            className="w-full flex items-center justify-center gap-2 p-2 text-sm border border-dashed border-border rounded-md hover:bg-muted/20 text-muted-foreground hover:text-foreground"
            onClick={() => alert("Model upload functionality would be implemented here")}
          >
            <UploadCloud size={16} />
            <span>Upload New Model</span>
          </button>
        </div>
      )}
    </div>
  );
}