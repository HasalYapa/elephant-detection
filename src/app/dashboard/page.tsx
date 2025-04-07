"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  StopCircle,
  AlertCircle,
  Database,
  Image,
  Clock,
  ChevronRight,
  BarChart2,
  Calendar,
  Cpu,
  Settings,
  ArrowRight,
  Camera
} from "lucide-react";
import SystemStats from "@/components/dashboard/system-stats";

interface ActiveTraining {
  id: string;
  name: string;
  dataset: string;
  model: string;
  progress: number;
  status: "running" | "paused" | "error";
  startTime: string;
  eta: string;
  epoch: number;
  totalEpochs: number;
  loss: number;
  mAP: number;
}

interface Dataset {
  id: string;
  name: string;
  imageCount: number;
  lastUpdated: string;
}

export default function DashboardPage() {
  const [activeTrainings, setActiveTrainings] = useState<ActiveTraining[]>([
    {
      id: "tr-1",
      name: "Elephant Detector v1",
      dataset: "Safari Images - Annotated",
      model: "YOLOv8m",
      progress: 67,
      status: "running",
      startTime: "2023-06-15 09:45:12",
      eta: "2h 15m",
      epoch: 67,
      totalEpochs: 100,
      loss: 1.45,
      mAP: 0.63,
    },
  ]);

  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: "ds-1",
      name: "Elephant Dataset 1",
      imageCount: 450,
      lastUpdated: "2023-12-15",
    },
    {
      id: "ds-2",
      name: "Safari Images - Annotated",
      imageCount: 250,
      lastUpdated: "2023-11-20",
    },
  ]);

  const [recentLogs, setRecentLogs] = useState<string[]>([
    "Training started with YOLOv8m on Safari Images dataset",
    "Epoch 65/100 completed, loss: 1.52, mAP: 0.61",
    "Epoch 66/100 completed, loss: 1.48, mAP: 0.62",
    "Epoch 67/100 completed, loss: 1.45, mAP: 0.63",
    "Checkpoint saved to /models/elephant_detector_v1_e67.pt",
  ]);

  // Simulate progress updates for demo purposes
  useEffect(() => {
    if (activeTrainings.length === 0) return;

    const interval = setInterval(() => {
      setActiveTrainings((trainings) =>
        trainings.map((training) => {
          if (training.status !== "running" || training.progress >= 100)
            return training;

          const newProgress = Math.min(training.progress + 1, 100);
          const newEpoch = Math.floor(
            (newProgress / 100) * training.totalEpochs,
          );
          const newLoss = 8.45 - (newProgress / 100) * 7.4;
          const newMAP = (newProgress / 100) * 0.72;

          return {
            ...training,
            progress: newProgress,
            epoch: newEpoch,
            loss: parseFloat(newLoss.toFixed(2)),
            mAP: parseFloat(newMAP.toFixed(2)),
          };
        }),
      );

      // Add new log entry
      if (Math.random() > 0.7) {
        const training = activeTrainings[0];

        if (training.status === "running") {
          const newEpoch =
            Math.floor((training.progress / 100) * training.totalEpochs) + 1;
          const newLoss = (8.45 - (training.progress / 100) * 7.4).toFixed(2);
          const newMAP = ((training.progress / 100) * 0.72).toFixed(2);

          setRecentLogs((logs) => [
            `Epoch ${newEpoch}/${training.totalEpochs} completed, loss: ${newLoss}, mAP: ${newMAP}`,
            ...logs.slice(0, 4),
          ]);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTrainings]);

  const handlePauseResume = (id: string) => {
    setActiveTrainings((trainings) =>
      trainings.map((training) =>
        training.id === id
          ? {
              ...training,
              status: training.status === "running" ? "paused" : "running",
            }
          : training,
      ),
    );
  };

  const handleStop = (id: string) => {
    setActiveTrainings((trainings) =>
      trainings.filter((training) => training.id !== id),
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Training Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Active Training Sessions
            </h2>
            <Link
              href="/training"
              className="text-sm text-primary hover:text-primary/90 flex items-center gap-1"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          {activeTrainings.length > 0 ? (
            <div className="space-y-4">
              {activeTrainings.map((training) => (
                <div
                  key={training.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-foreground">
                        {training.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {training.model} on {training.dataset}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {training.status === "error" ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive">
                          Error
                        </span>
                      ) : training.status === "paused" ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500">
                          Paused
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-500">
                          Running
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress: {training.progress}%</span>
                        <span>
                          Epoch: {training.epoch}/{training.totalEpochs}
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            training.status === "error"
                              ? "bg-destructive"
                              : training.status === "paused"
                                ? "bg-yellow-500"
                                : "bg-primary"
                          }`}
                          style={{ width: `${training.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        <span>Started: {training.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        <span>Est. completion: {training.eta}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-2 bg-muted/50 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">
                          Loss
                        </div>
                        <div className="font-semibold">
                          {training.loss.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">
                          mAP@0.5
                        </div>
                        <div className="font-semibold">
                          {training.mAP.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handlePauseResume(training.id)}
                        className="p-2 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 flex items-center gap-1"
                      >
                        {training.status === "running" ? (
                          <>
                            <Pause size={14} />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            <span>Resume</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleStop(training.id)}
                        className="p-2 text-xs font-medium rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center gap-1"
                      >
                        <StopCircle size={14} />
                        <span>Stop</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-lg">
              <div className="text-muted-foreground mb-2">
                <Cpu size={36} />
              </div>
              <p className="text-muted-foreground">
                No active training sessions
              </p>
              <Link
                href="/training"
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
              >
                Start a new training
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* System Stats Card */}
          <SystemStats />
          
          {/* Datasets Card */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Datasets</h2>
              <Link
                href="/datasets"
                className="text-sm text-primary hover:text-primary/90 flex items-center gap-1"
              >
                View all
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="border border-border rounded-lg p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-muted/50 p-2 rounded-md">
                      <Database size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {dataset.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Image size={12} />
                          <span>{dataset.imageCount} images</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Updated: {dataset.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/datasets?upload=true"
                className="block text-center py-2 border border-dashed border-border rounded-lg text-sm text-primary hover:text-primary/90 hover:bg-muted/20"
              >
                + Upload new dataset
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Logs & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Recent Logs
            </h2>
            <Link
              href="/logs"
              className="text-sm text-primary hover:text-primary/90 flex items-center gap-1"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {recentLogs.map((log, index) => (
              <div
                key={index}
                className="p-2 border-b border-border last:border-0"
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Quick Links
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/training"
              className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
            >
              <Play size={24} className="text-primary mb-2" />
              <span className="text-sm font-medium">Start Training</span>
            </Link>

            <Link
              href="/detection"
              className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
            >
              <Camera size={24} className="text-primary mb-2" />
              <span className="text-sm font-medium">Live Detection</span>
            </Link>

            <Link
              href="/inference"
              className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
            >
              <Image size={24} className="text-primary mb-2" />
              <span className="text-sm font-medium">Run Inference</span>
            </Link>

            <Link
              href="/logs"
              className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
            >
              <BarChart2 size={24} className="text-primary mb-2" />
              <span className="text-sm font-medium">View Metrics</span>
            </Link>

            <Link
              href="/datasets?upload=true"
              className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
            >
              <Database size={24} className="text-primary mb-2" />
              <span className="text-sm font-medium">Upload Dataset</span>
            </Link>

            <Link
              href="/settings"
              className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
            >
              <Settings size={24} className="text-primary mb-2" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
          
          <div className="mt-6 p-4 border border-primary/20 bg-primary/5 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-foreground">Start with YOLOv8 Training</h3>
                <p className="text-sm text-muted-foreground mt-1">Learn how to train your own elephant detection model</p>
              </div>
              <Link
                href="/docs/quickstart"
                className="flex items-center text-primary hover:text-primary/90 text-sm"
              >
                View guide <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
