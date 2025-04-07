"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Database, Image, Edit2, Trash2, Download, Play } from "lucide-react";

interface Dataset {
  id: string;
  name: string;
  images: number;
  annotations: number;
  dateCreated: string;
  size: string;
}

export default function DatasetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating fetch of dataset details
    setTimeout(() => {
      // Mock data
      if (params.id === "1") {
        setDataset({
          id: "1",
          name: "Elephant Dataset 1",
          images: 450,
          annotations: 780,
          dateCreated: "2023-12-15",
          size: "2.3 GB",
        });
      } else if (params.id === "2") {
        setDataset({
          id: "2",
          name: "Safari Images - Annotated",
          images: 250,
          annotations: 320,
          dateCreated: "2023-11-20",
          size: "1.5 GB",
        });
      } else {
        // Try to parse the ID for demo datasets created through the UI
        const parsedId = params.id.replace("ds-", "");
        const timestamp = parseInt(parsedId);
        if (!isNaN(timestamp)) {
          const date = new Date(timestamp);
          setDataset({
            id: params.id,
            name: `Dataset from ${date.toLocaleDateString()}`,
            images: Math.floor(Math.random() * 500) + 100,
            annotations: Math.floor(Math.random() * 800) + 200,
            dateCreated: date.toISOString().split('T')[0],
            size: `${(Math.random() * 3 + 1).toFixed(1)} GB`,
          });
        } else {
          router.push("/datasets");
        }
      }
      setLoading(false);
    }, 800);
  }, [params.id, router]);

  // Sample images for demonstration
  const sampleImages = [
    "/placeholder1.jpg",
    "/placeholder2.jpg",
    "/placeholder3.jpg",
    "/placeholder4.jpg",
    "/placeholder5.jpg",
    "/placeholder6.jpg",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Dataset Not Found</h1>
        <p className="text-muted-foreground mb-6">The dataset you're looking for doesn't exist or has been deleted.</p>
        <Link 
          href="/datasets" 
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Datasets
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link 
          href="/datasets" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to datasets
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">{dataset.name}</h1>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted/50 flex items-center gap-1">
              <Edit2 size={16} />
              Edit
            </button>
            <button className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted/50 flex items-center gap-1">
              <Download size={16} />
              Export
            </button>
            <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-1">
              <Play size={16} />
              Train Model
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dataset Information</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{dataset.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="font-mono text-xs">{dataset.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Created</p>
                <p>{dataset.dateCreated}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Images</p>
                <p>{dataset.images}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annotations</p>
                <p>{dataset.annotations}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p>{dataset.size}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dataset Stats</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Images with annotations</span>
                  <span className="text-sm font-medium">{Math.round(dataset.annotations / dataset.images * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.round(dataset.annotations / dataset.images * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Class distribution</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Elephant</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Human</span>
                      <span>20%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Vehicle</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sample Images</h2>
          <button className="text-sm text-primary hover:text-primary/80">View all images</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* For demo purposes, we'll show empty placeholders */}
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-muted/50 rounded-md flex items-center justify-center overflow-hidden">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Image size={24} strokeWidth={1.5} className="mb-1" />
                <span className="text-xs">Sample {i+1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Training History</h2>
        </div>
        
        {/* Empty state */}
        <div className="text-center py-8">
          <Database size={40} className="mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No models trained yet</h3>
          <p className="text-muted-foreground mb-4">This dataset hasn't been used for training any models yet.</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-2 mx-auto">
            <Play size={16} />
            Start Training
          </button>
        </div>
      </div>
    </div>
  );
} 