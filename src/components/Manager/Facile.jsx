import React, { useRef, useState, useEffect } from "react";
import {
  loadModels,
  detectFaces,
} from "../../FacialRecognition/facialRecognition";
import axios from "axios";

const Facile = ({ onCapture }) => {
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

      // If faces detected and onCapture prop exists, send the descriptor to parent
      if (faces.length > 0 && onCapture) {
        onCapture(faces[0].descriptor);
      }
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

  return (
    <div className="w-full">
      <div className="bg-white rounded shadow-md relative">
        <div className="relative mb-4">
          <video
            ref={videoRef}
            width={videoDimensions.width}
            height={videoDimensions.height}
            autoPlay
            muted
            className="w-full h-64 bg-gray-200 rounded"
          />
          <canvas
            ref={canvasRef}
            width={videoDimensions.width}
            height={videoDimensions.height}
            className="absolute top-0 left-0 w-full h-64"
          />
        </div>
        <div className="flex justify-center mb-4">
          <button
            onClick={handleDetectFaces}
            className="bg-[#02aafd] text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={loading}>
            {loading ? "Detecting..." : "Detect Face"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Facile;
