import React, { useRef, useState, useEffect } from "react";
import {
  loadModels,
  detectFaces,
} from "../../FacialRecognition/facialRecognition";
import axios from "axios";

const Facile = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const startVideo = async () => {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          setVideoDimensions({
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
          videoRef.current.play();
        };
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleDetectFaces = async () => {
    setLoading(true);
    try {
      const faces = await detectFaces(videoRef.current);
      setDetections(faces);
      drawDetections(faces);

      // Log detection results to console
      console.log(
        "Detected Faces:",
        faces.map((face, index) => ({
          faceNumber: index + 1,
          boundingBox: face.detection.box,
          confidence: face.detection.score,
          descriptorPreview: Array.from(face.descriptor).slice(0, 5), // First 5 elements
          landmarksPreview: face.landmarks.positions.slice(0, 3), // First 3 landmarks
        })),
      );
    } catch (error) {
      console.error("Detection error:", error);
    }
    setLoading(false);
  };

  const drawDetections = (detections) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection) => {
      const { x, y, width, height } = detection.detection.box;
      context.lineWidth = 2;
      context.strokeStyle = "#02aafd";
      context.strokeRect(x, y, width, height);
    });
  };

  const handleSaveToBackend = async () => {
    try {
      const faceData = detections.map((detection) => ({
        descriptor: Array.from(detection.descriptor),
        landmarks: detection.landmarks.positions.map((pos) => ({
          x: pos.x,
          y: pos.y,
        })),
        box: detection.detection.box,
      }));

      // Log full data structure before sending
      console.log("Saving to backend:", {
        faces: faceData.map((face) => ({
          ...face,
          descriptorPreview: face.descriptor.slice(0, 5), // First 5 elements
          landmarksPreview: face.landmarks.slice(0, 3), // First 3 landmarks
        })),
      });

      await axios.post("http://localhost:8092/api/facial-recognition", {
        faces: faceData,
      });
      alert("Faces saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save faces.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Facial Recognition</h1>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl relative">
        <div className="relative">
          <video
            ref={videoRef}
            width={videoDimensions.width}
            height={videoDimensions.height}
            autoPlay
            muted
            className="w-full h-64 bg-gray-200 rounded mb-4"
          />
          <canvas
            ref={canvasRef}
            width={videoDimensions.width}
            height={videoDimensions.height}
            className="absolute top-0 left-0 w-full h-64"
          />
        </div>
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleDetectFaces}
            className="bg-[#02aafd] text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={loading}>
            {loading ? "Detecting..." : "Detect Faces"}
          </button>
          <button
            onClick={handleSaveToBackend}
            className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors">
            Save to Backend
          </button>
        </div>
      </div>
    </div>
  );
};

export default Facile;
