import { Html5Qrcode } from "html5-qrcode";

export const initializeQrScanner = (elementId, onSuccess, onError) => {
  const qrScanner = new Html5Qrcode(elementId);

  const config = {
    fps: 10, // Frames per second
    qrbox: 250, // QR Code scanning box size
  };

  qrScanner
    .start(
      { facingMode: "environment" }, // Use the back camera
      config,
      (decodedText, decodedResult) => {
        onSuccess(decodedText, decodedResult);
      },
      (errorMessage) => {
        if (onError) onError(errorMessage);
      },
    )
    .catch((err) => {
      console.error("Error starting QR Code scanner:", err);
    });

  return qrScanner;
};

export const stopQrScanner = (qrScanner) => {
  qrScanner.stop().catch((err) => {
    console.error("Error stopping QR Code scanner:", err);
  });
};
