"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Upload, X, Eye, Edit2, Trash2, AlertCircle, Loader2 } from "lucide-react";

interface Dataset {
  id: string;
  name: string;
  images: number;
  annotations: number;
  dateCreated: string;
  size: string;
}

// Helper to save datasets to localStorage
const saveDatasets = (datasets: Dataset[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('uploadedDatasets', JSON.stringify(datasets));
  }
};

// Helper to load datasets from localStorage
const loadDatasets = (): Dataset[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('uploadedDatasets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved datasets', e);
      }
    }
  }
  return [
    {
      id: "1",
      name: "Elephant Dataset 1",
      images: 450,
      annotations: 780,
      dateCreated: "2023-12-15",
      size: "2.3 GB",
    },
    {
      id: "2",
      name: "Safari Images - Annotated",
      images: 250,
      annotations: 320,
      dateCreated: "2023-11-20",
      size: "1.5 GB",
    },
  ];
};

export default function DatasetsPage() {
  const searchParams = useSearchParams();
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  // Load datasets from localStorage on initial render
  useEffect(() => {
    setDatasets(loadDatasets());
  }, []);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check for upload=true in URL and open the upload modal
  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      setShowUploadModal(true);
    }
  }, [searchParams]);

  // Handle dataset actions
  const handleEditDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setFormData({
      name: dataset.name,
      description: ""
    });
    setShowEditModal(true);
  };

  const handleDeleteDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setShowDeleteModal(true);
  };

  // Handle modal submissions
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDataset) return;
    
    // Update dataset in state
    const updatedDatasets = datasets.map(dataset => 
      dataset.id === selectedDataset.id 
        ? { ...dataset, name: formData.name } 
        : dataset
    );
    
    setDatasets(updatedDatasets);
    saveDatasets(updatedDatasets); // Save to localStorage
    setShowEditModal(false);
    
    // Show a success message (you could use a toast here)
    alert(`Dataset "${formData.name}" updated successfully!`);
  };

  const handleDeleteSubmit = () => {
    if (!selectedDataset) return;
    
    // Remove dataset from state
    const updatedDatasets = datasets.filter(dataset => dataset.id !== selectedDataset.id);
    setDatasets(updatedDatasets);
    saveDatasets(updatedDatasets); // Save to localStorage
    setShowDeleteModal(false);
    
    // Show a success message
    alert(`Dataset "${selectedDataset.name}" deleted successfully!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    // Simulate upload process
    setIsUploading(true);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Add new dataset to state after "upload" completes
          setTimeout(() => {
            const newDataset: Dataset = {
              id: `ds-${Date.now()}`,
              name: formData.name || selectedFile.name.replace(/\.[^/.]+$/, ""),
              images: Math.floor(Math.random() * 500) + 100,
              annotations: Math.floor(Math.random() * 800) + 200,
              dateCreated: new Date().toISOString().split('T')[0],
              size: `${(selectedFile.size / (1024 * 1024 * 1024)).toFixed(1)} GB`
            };
            
            const updatedDatasets = [...datasets, newDataset];
            setDatasets(updatedDatasets);
            saveDatasets(updatedDatasets); // Save to localStorage
            
            setIsUploading(false);
            setUploadProgress(0);
            setShowUploadModal(false);
            setSelectedFile(null);
            setFormData({ name: "", description: "" });
            
            // Show success message
            alert(`Dataset "${newDataset.name}" uploaded successfully!`);
          }, 500);
          
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dataset Management</h1>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 flex items-center gap-2"
        >
          <Upload size={18} />
          Upload New Dataset
        </button>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Images</th>
                <th className="px-4 py-3 text-left">Annotations</th>
                <th className="px-4 py-3 text-left">Date Created</th>
                <th className="px-4 py-3 text-left">Size</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset) => (
                <tr
                  key={dataset.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="px-4 py-3">{dataset.name}</td>
                  <td className="px-4 py-3">{dataset.images}</td>
                  <td className="px-4 py-3">{dataset.annotations}</td>
                  <td className="px-4 py-3">{dataset.dateCreated}</td>
                  <td className="px-4 py-3">{dataset.size}</td>
                  <td className="px-4 py-3 flex space-x-2">
                    <Link 
                      href={`/datasets/${dataset.id}`}
                      className="text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </Link>
                    <button 
                      onClick={() => handleEditDataset(dataset)}
                      className="text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteDataset(dataset)}
                      className="text-destructive hover:text-destructive/80 flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {datasets.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No datasets available. Upload your first dataset to get started.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          How to prepare your dataset
        </h2>
        <p className="text-muted-foreground mb-4">
          For the best results with elephant detection, prepare your datasets in
          the YOLO format:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Images should be in JPG or PNG format</li>
          <li>Annotations must be in YOLO format (one .txt file per image)</li>
          <li>Include a classes.txt file listing your object classes</li>
          <li>Organize in folders: /images and /labels</li>
          <li>Compress everything into a ZIP file before uploading</li>
        </ul>
        <Link
          href="https://docs.ultralytics.com/datasets/detect"
          target="_blank"
          className="inline-block mt-4 text-primary hover:underline"
        >
          Learn more about YOLO dataset format
        </Link>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload New Dataset</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dataset Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Elephant Dataset 3"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea 
                    placeholder="Describe your dataset..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary h-20"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Dataset File (ZIP)</label>
                  <div className={`border-2 border-dashed p-4 rounded-lg text-center ${selectedFile ? 'border-primary/50' : 'border-border'}`}>
                    {selectedFile ? (
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button 
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="mt-2 text-sm text-destructive hover:text-destructive/80"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop your ZIP file here, or click to browse
                        </p>
                        <input
                          type="file"
                          id="dataset-file"
                          accept=".zip"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label 
                          htmlFor="dataset-file"
                          className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm cursor-pointer"
                        >
                          Browse Files
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {isUploading && (
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

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${
                      !selectedFile || isUploading
                        ? 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Dataset
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dataset Modal */}
      {showEditModal && selectedDataset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Dataset</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dataset Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary h-20"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDataset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <AlertCircle size={24} />
              <h2 className="text-xl font-semibold">Delete Dataset</h2>
            </div>

            <p className="mb-4">
              Are you sure you want to delete <strong>{selectedDataset.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-border rounded hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
