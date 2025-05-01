import React, { useRef, useState, useEffect } from "react";
import {
  loadModels,
  detectFaces,
} from "../../FacialRecognition/facialRecognition";
import axios from "axios";

const Facile = () => {
  const videoRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startVideo = async () => {
      await loadModels();
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Error accessing webcam:", err));
    };

    startVideo();
  }, []);

  const handleDetectFaces = async () => {
    setLoading(true);
    const faces = await detectFaces(videoRef.current);
    setDetections(faces);
    setLoading(false);
  };

  const handleSaveToBackend = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8092/api/facial-recognition",
        {
          faces: detections,
        },
      );
      alert("Faces saved successfully!");
    } catch (error) {
      console.error("Error saving faces:", error);
      alert("Failed to save faces.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Facial Recognition</h1>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <video
          ref={videoRef}
          width={640}
          height={480}
          autoPlay
          muted
          className="w-full h-64 bg-gray-200 rounded mb-4"></video>
        <div className="flex gap-4">
          <button
            onClick={handleDetectFaces}
            className="bg-[#02aafd] text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            {loading ? "Detecting..." : "Detect Faces"}
          </button>
          <button
            onClick={handleSaveToBackend}
            className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors">
            Save to Backend
          </button>
        </div>
        {detections.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Detections:</h2>
            <ul className="list-disc pl-6">
              {detections.map((detection, index) => (
                <li key={index}>
                  Face {index + 1}: {JSON.stringify(detection.descriptor)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Facile;
