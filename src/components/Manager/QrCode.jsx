import React, { useEffect, useRef, useState } from "react";
import {
  initializeQrScanner,
  stopQrScanner,
} from "../../QRCodeScanner/qrScanner";
import axios from "axios";

const QrCode = () => {
  const scannerRef = useRef(null);
  const [qrScanner, setQrScanner] = useState(null);
  const [scannedData, setScannedData] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const startScanner = () => {
      const scanner = initializeQrScanner(
        "qr-reader",
        (decodedText) => {
          setScannedData(decodedText);
          setError("");
        },
        (errorMessage) => {
          setError(errorMessage);
        },
      );
      setQrScanner(scanner);
    };

    startScanner();

    return () => {
      if (qrScanner) stopQrScanner(qrScanner);
    };
  }, []);

  const handleSendToBackend = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/qr-code", {
        data: scannedData,
      });
      alert("QR Code data sent successfully!");
    } catch (error) {
      console.error("Error sending QR Code data:", error);
      alert("Failed to send QR Code data.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">QR Code Scanner</h1>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <div
          id="qr-reader"
          className="w-full h-64 bg-gray-200 rounded mb-4"></div>
        {scannedData && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Scanned Data:</h2>
            <p className="text-gray-700">{scannedData}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 text-red-500">
            <p>Error: {error}</p>
          </div>
        )}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSendToBackend}
            className="bg-[#02aafd] text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={!scannedData}>
            Send to Backend
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrCode;
