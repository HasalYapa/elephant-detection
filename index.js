import { useEffect, useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [detection, setDetection] = useState("No Detection");

  useEffect(() => {
    // Replace with your hosted Flask API URL
    setVideoUrl("https://elephant-detect-api.railway.app/video_feed");

    // Poll the backend every 5 seconds for detection
    const interval = setInterval(() => {
      fetch("https://elephant-detect-api.railway.app/detect")
        .then((res) => res.json())
        .then((data) => {
          setDetection(data.detected ? "🚨 Elephant Detected!" : "No Detection");
        });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold">Live Elephant Monitoring</h1>
      <img src={videoUrl} alt="Live Feed" className="rounded-lg shadow-lg my-4" />
      <p className="text-lg font-semibold">{detection}</p>
    </div>
  );
}
