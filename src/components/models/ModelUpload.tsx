'use client';

import { useState, useRef } from 'react';
import { Upload, AlertCircle, Loader2, X } from 'lucide-react';
import { getAvailableModels } from '@/lib/api';

interface ModelUploadProps {
  onUploadComplete?: () => void;
}

export default function ModelUpload({ onUploadComplete }: ModelUploadProps) {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setModelFile(file);
      setUploadError(null);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file extension
    if (!file.name.endsWith('.pt')) {
      setUploadError('Only PyTorch (.pt) model files are supported');
      return false;
    }

    // Check file size (max 2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setUploadError('Model file is too large (max 2GB)');
      return false;
    }

    return true;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!modelFile) {
      setUploadError('Please select a model file to upload');
      return;
    }
    
    if (!validateFile(modelFile)) {
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      
      // In a real implementation, you would upload the file to your backend
      // For this demo, we'll simulate uploading and add the model to localStorage
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      // Simulate API latency
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        
        // Add model to localStorage
        if (typeof window !== 'undefined') {
          try {
            // Get existing models
            const existingModelsJson = localStorage.getItem('availableModels');
            let models = ["yolov8m.pt", "yolov8n.pt"];
            
            if (existingModelsJson) {
              const parsed = JSON.parse(existingModelsJson);
              if (Array.isArray(parsed)) {
                models = parsed;
              }
            }
            
            // If model doesn't already exist, add it
            if (!models.includes(modelFile.name)) {
              models.push(modelFile.name);
              localStorage.setItem('availableModels', JSON.stringify(models));
              
              // Add mock model details
              const modelDetails = {
                name: modelFile.name,
                datasetName: 'Custom Upload',
                baseModel: modelFile.name.includes('yolov8') ? modelFile.name : 'custom',
                trainedOn: new Date().toISOString(),
                epochs: 50,
                accuracy: 75 + Math.random() * 15 // Mock accuracy between 75-90%
              };
              
              const existingDetailsJson = localStorage.getItem('modelDetails');
              let modelDetailsArr = existingDetailsJson ? JSON.parse(existingDetailsJson) : [];
              modelDetailsArr.push(modelDetails);
              localStorage.setItem('modelDetails', JSON.stringify(modelDetailsArr));
            }
            
            // Finish upload
            setTimeout(() => {
              setUploading(false);
              setModelFile(null);
              setUploadProgress(0);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              
              // Call completion handler
              if (onUploadComplete) {
                onUploadComplete();
              }
            }, 500);
            
          } catch (error) {
            console.error('Error saving model to localStorage:', error);
            setUploadError('Failed to save model information');
            setUploading(false);
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload model. Please try again.');
      setUploading(false);
    }
  };
  
  const resetUpload = () => {
    setModelFile(null);
    setUploadError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-medium mb-4">Upload New Model</h3>
      
      <form onSubmit={handleUpload}>
        {uploadError && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 mb-4 flex items-start text-sm">
            <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>{uploadError}</div>
          </div>
        )}
        
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
                onClick={resetUpload}
                className="mt-2 text-sm text-destructive hover:text-destructive/80 flex items-center mx-auto"
              >
                <X size={14} className="mr-1" />
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
                ref={fileInputRef}
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
        
        {uploading && (
          <div className="mt-4">
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
          disabled={!modelFile || uploading}
          className="w-full mt-4 bg-primary text-white py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
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
  );
} 