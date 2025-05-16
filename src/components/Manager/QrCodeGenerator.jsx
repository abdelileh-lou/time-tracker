import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

const QrCodeGenerator = ({ onScan }) => {
  const [qrData, setQrData] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    const generateQrCode = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8092/api/attendance/qr-code",
        );
        setQrData(response.data.qrCode);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQrCode();
    const interval = setInterval(generateQrCode, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="col-span-6 bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-center">
        QR Code de Pointage
      </h3>
      <div className="flex flex-col items-center justify-center">
        {qrData && (
          <>
            <QRCodeSVG
              value={qrData}
              size={256}
              level="H"
              includeMargin
              className="mb-4"
            />
            <p className="text-sm text-gray-500">
              Scannez ce code QR pour pointer (Actualise toutes les 30 secondes)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default QrCodeGenerator;
