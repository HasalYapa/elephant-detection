"use client";

import { useState } from "react";

interface LogEntry {
  timestamp: string;
  message: string;
  level: "info" | "warning" | "error";
}

interface MetricPoint {
  epoch: number;
  loss: number;
  mAP: number;
  precision: number;
  recall: number;
}

export default function LogsPage() {
  const [selectedModel, setSelectedModel] = useState(
    "training_20230615_elephants",
  );
  const [logFilter, setLogFilter] = useState("all");

  // Mock data for demonstration
  const logs: LogEntry[] = [
    {
      timestamp: "2023-06-15 10:23:45",
      message: "Training started with YOLOv8n",
      level: "info",
    },
    {
      timestamp: "2023-06-15 10:25:12",
      message: "Epoch 1/100 completed, loss: 8.45",
      level: "info",
    },
    {
      timestamp: "2023-06-15 10:35:22",
      message: "Epoch 10/100 completed, loss: 5.21",
      level: "info",
    },
    {
      timestamp: "2023-06-15 10:45:36",
      message: "CUDA out of memory error. Batch size reduced.",
      level: "error",
    },
    {
      timestamp: "2023-06-15 10:46:05",
      message: "Training resumed with batch size 8",
      level: "info",
    },
    {
      timestamp: "2023-06-15 11:15:45",
      message: "Epoch 20/100 completed, loss: 3.56",
      level: "info",
    },
    {
      timestamp: "2023-06-15 11:30:12",
      message: "Warning: Learning rate may be too high",
      level: "warning",
    },
    {
      timestamp: "2023-06-15 12:05:35",
      message: "Epoch 30/100 completed, loss: 2.87",
      level: "info",
    },
    {
      timestamp: "2023-06-15 13:15:22",
      message: "Checkpoint saved to /models/checkpoint_30.pt",
      level: "info",
    },
    {
      timestamp: "2023-06-15 14:25:18",
      message: "Epoch 40/100 completed, loss: 2.32",
      level: "info",
    },
  ];

  const metrics: MetricPoint[] = [
    { epoch: 1, loss: 8.45, mAP: 0.05, precision: 0.12, recall: 0.08 },
    { epoch: 10, loss: 5.21, mAP: 0.18, precision: 0.26, recall: 0.22 },
    { epoch: 20, loss: 3.56, mAP: 0.32, precision: 0.41, recall: 0.35 },
    { epoch: 30, loss: 2.87, mAP: 0.45, precision: 0.52, recall: 0.48 },
    { epoch: 40, loss: 2.32, mAP: 0.51, precision: 0.58, recall: 0.54 },
    { epoch: 50, loss: 1.95, mAP: 0.57, precision: 0.64, recall: 0.59 },
    { epoch: 60, loss: 1.68, mAP: 0.6, precision: 0.67, recall: 0.62 },
    { epoch: 70, loss: 1.45, mAP: 0.63, precision: 0.7, recall: 0.65 },
    { epoch: 80, loss: 1.28, mAP: 0.65, precision: 0.72, recall: 0.67 },
    { epoch: 90, loss: 1.15, mAP: 0.67, precision: 0.73, recall: 0.69 },
    { epoch: 100, loss: 1.05, mAP: 0.69, precision: 0.75, recall: 0.71 },
  ];

  const filteredLogs =
    logFilter === "all" ? logs : logs.filter((log) => log.level === logFilter);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Logs & Metrics</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
        <div>
          <label className="block text-sm font-medium mb-1">
            Training Session
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="p-2 border border-input rounded bg-background"
          >
            <option value="training_20230615_elephants">
              Elephant Detector v1 (15-06-2023)
            </option>
            <option value="training_20230712_wildlife">
              Wildlife Detector (12-07-2023)
            </option>
            <option value="training_20230827_safari">
              Safari Animals (27-08-2023)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Log Filter</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setLogFilter("all")}
              className={`px-3 py-1 rounded ${
                logFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLogFilter("info")}
              className={`px-3 py-1 rounded ${
                logFilter === "info"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setLogFilter("warning")}
              className={`px-3 py-1 rounded ${
                logFilter === "warning"
                  ? "bg-yellow-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Warnings
            </button>
            <button
              onClick={() => setLogFilter("error")}
              className={`px-3 py-1 rounded ${
                logFilter === "error"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Errors
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Training Logs</h2>

          <div className="bg-muted/30 rounded-md p-3 h-[500px] overflow-y-auto font-mono text-xs">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`border-b border-border/50 py-2 ${
                  log.level === "error"
                    ? "text-destructive"
                    : log.level === "warning"
                      ? "text-yellow-500"
                      : "text-foreground"
                }`}
              >
                <span className="opacity-70">[{log.timestamp}]</span>{" "}
                <span>{log.message}</span>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  No logs matching the selected filter.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Training Metrics</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-2">Loss</h3>
              <div className="bg-muted/30 rounded-md h-[120px] p-4 overflow-hidden">
                {/* Using a very simple visualization for now - would be replaced with a proper chart library like Recharts */}
                <div className="w-full h-full flex items-end">
                  {metrics.map((point, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-4 bg-primary rounded-t-sm"
                        style={{
                          height: `${100 - (point.loss / 10) * 100}%`,
                          marginTop: "auto",
                        }}
                      />
                      <span className="text-[0.6rem] mt-1 text-muted-foreground">
                        {point.epoch}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-2">
                Mean Average Precision (mAP@0.5)
              </h3>
              <div className="bg-muted/30 rounded-md h-[120px] p-4 overflow-hidden">
                <div className="w-full h-full flex items-end">
                  {metrics.map((point, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-4 bg-blue-500 rounded-t-sm"
                        style={{
                          height: `${point.mAP * 100}%`,
                          marginTop: "auto",
                        }}
                      />
                      <span className="text-[0.6rem] mt-1 text-muted-foreground">
                        {point.epoch}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-base font-medium mb-2">Precision</h3>
                <div className="bg-muted/30 rounded-md h-[120px] p-4 overflow-hidden">
                  <div className="w-full h-full flex items-end">
                    {metrics.map((point, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className="w-2 bg-green-500 rounded-t-sm"
                          style={{
                            height: `${point.precision * 100}%`,
                            marginTop: "auto",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2">Recall</h3>
                <div className="bg-muted/30 rounded-md h-[120px] p-4 overflow-hidden">
                  <div className="w-full h-full flex items-end">
                    {metrics.map((point, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className="w-2 bg-purple-500 rounded-t-sm"
                          style={{
                            height: `${point.recall * 100}%`,
                            marginTop: "auto",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
