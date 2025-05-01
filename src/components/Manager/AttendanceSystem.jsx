import React, { useRef, useState, useEffect } from "react";
import {
  loadModels,
  detectFaces,
  compareFaces,
} from "../../FacialRecognition/facialRecognition";
import {
  initializeQrScanner,
  stopQrScanner,
} from "../../QRCodeScanner/qrScanner";
import axios from "axios";

const AttendanceSystem = () => {
  const videoRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState("qrcode"); // Default to QR code
  const [qrScanner, setQrScanner] = useState(null);
  const [scannedData, setScannedData] = useState("");
  const [error, setError] = useState("");
  const [stream, setStream] = useState(null);

  // Effect for handling video stream
  useEffect(() => {
    // Function to start video for facial recognition
    const startVideo = async () => {
      if (authMethod === "facial") {
        await loadModels();
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setStream(mediaStream);
        } catch (err) {
          console.error("Error accessing webcam:", err);
          setError("Failed to access camera. Please check permissions.");
        }
      } else if (stream) {
        // Stop all video tracks when switching away from facial recognition
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };

    startVideo();

    return () => {
      // Clean up video stream when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [authMethod]);

  // Effect for QR code scanner
  useEffect(() => {
    let scanner = null;

    const startScanner = () => {
      if (authMethod === "qrcode") {
        const newScanner = initializeQrScanner(
          "qr-reader",
          (decodedText) => {
            setScannedData(decodedText);
            setError("");
          },
          (errorMessage) => {
            setError(errorMessage);
          },
        );
        setQrScanner(newScanner);
        return newScanner;
      }
      return null;
    };

    scanner = startScanner();

    return () => {
      if (scanner) {
        stopQrScanner(scanner);
      }
    };
  }, [authMethod]);

  const handleAuthMethodChange = (method) => {
    // Clean up previous method
    if (authMethod === "qrcode" && qrScanner) {
      stopQrScanner(qrScanner);
      setQrScanner(null);
    } else if (authMethod === "facial" && stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    // Set new method
    setAuthMethod(method);
    setScannedData("");
    setDetections([]);
    setError("");
  };

  const handleDetectFaces = async () => {
    if (!videoRef.current || !stream) {
      setError("Camera not initialized properly");
      return;
    }

    setLoading(true);
    try {
      const faces = await detectFaces(videoRef.current);
      setDetections(faces);

      if (faces.length === 0) {
        setError("No faces detected. Please try again.");
      } else {
        // Here you would normally compare with faces in your database
        console.log(`Detected ${faces.length} face(s)`);
      }
    } catch (err) {
      console.error("Error detecting faces:", err);
      setError("Error processing facial data");
    }
    setLoading(false);
  };

  const handleRecognizeFace = async () => {
    if (detections.length === 0) {
      setError("Please detect faces first");
      return;
    }

    setLoading(true);
    try {
      // Send facial data to backend for verification
      const response = await axios.post(
        "http://localhost:8092/api/facial-recognition/verify",
        {
          faceDescriptor: detections[0].descriptor,
        },
      );

      if (response.data.match) {
        alert(`Employee identified: ${response.data.employeeName}`);
        // Mark attendance
        await markAttendance(response.data.employeeId, "facial");
      } else {
        setError("No matching employee found");
      }
    } catch (error) {
      console.error("Error recognizing face:", error);
      setError("Failed to verify face");
    }
    setLoading(false);
  };

  const handleProcessQrCode = async () => {
    if (!scannedData) {
      setError("No QR code scanned yet");
      return;
    }

    setLoading(true);
    try {
      // Send QR data to backend for verification
      const response = await axios.post(
        "http://localhost:8092/api/qr-code/verify",
        {
          qrData: scannedData,
        },
      );

      if (response.data.valid) {
        alert(`QR code valid for employee: ${response.data.employeeName}`);
        // Mark attendance
        await markAttendance(response.data.employeeId, "qrcode");
      } else {
        setError("Invalid or expired QR code");
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      setError("Failed to verify QR code");
    }
    setLoading(false);
  };

  const markAttendance = async (employeeId, method) => {
    try {
      const response = await axios.post(
        "http://localhost:8092/api/attendance",
        {
          employeeId,
          method,
          timestamp: new Date().toISOString(),
        },
      );

      alert("Attendance marked successfully!");
      // Reset states
      setScannedData("");
      setDetections([]);
    } catch (error) {
      console.error("Error marking attendance:", error);
      setError("Failed to mark attendance");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Employee Attendance System</h1>

      {/* Authentication Method Toggle */}
      <div className="mb-6 bg-white p-4 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Authentication Method</h2>
        <div className="flex gap-4">
          <button
            onClick={() => handleAuthMethodChange("qrcode")}
            className={`px-4 py-2 rounded transition-colors ${
              authMethod === "qrcode"
                ? "bg-[#02aafd] text-white"
                : "bg-gray-200 text-gray-700"
            }`}>
            QR Code Scanner
          </button>
          <button
            onClick={() => handleAuthMethodChange("facial")}
            className={`px-4 py-2 rounded transition-colors ${
              authMethod === "facial"
                ? "bg-[#02aafd] text-white"
                : "bg-gray-200 text-gray-700"
            }`}>
            Facial Recognition
          </button>
        </div>
      </div>

      {/* QR Code Scanner */}
      {authMethod === "qrcode" && (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">QR Code Scanner</h2>
          <div
            id="qr-reader"
            className="w-full h-64 bg-gray-200 rounded mb-4"></div>

          {scannedData && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Scanned Data:</h3>
              <p className="text-gray-700">{scannedData}</p>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleProcessQrCode}
              disabled={!scannedData || loading}
              className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors disabled:bg-gray-400">
              {loading ? "Processing..." : "Verify & Mark Attendance"}
            </button>
          </div>
        </div>
      )}

      {/* Facial Recognition */}
      {authMethod === "facial" && (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Facial Recognition</h2>
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-64 bg-gray-200 rounded mb-4"></video>

          <div className="flex gap-4">
            <button
              onClick={handleDetectFaces}
              disabled={loading}
              className="bg-[#02aafd] text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400">
              {loading ? "Detecting..." : "Detect Face"}
            </button>

            <button
              onClick={handleRecognizeFace}
              disabled={loading || detections.length === 0}
              className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors disabled:bg-gray-400">
              {loading ? "Processing..." : "Verify & Mark Attendance"}
            </button>
          </div>

          {detections.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Detection Status:</h3>
              <p className="text-green-600">Face detected successfully!</p>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl w-full">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceSystem;
