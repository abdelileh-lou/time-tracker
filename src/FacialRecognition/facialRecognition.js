import * as faceapi from "face-api.js";

export const loadModels = async () => {
  const MODEL_URL = "/models"; // Path to models folder
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
};

export const detectFaces = async (videoElement) => {
  const detections = await faceapi
    .detectAllFaces(videoElement)
    .withFaceLandmarks()
    .withFaceDescriptors();
  return detections;
};

export const compareFaces = async (faceDescriptor1, faceDescriptor2) => {
  // Compare faces logic
  return faceDescriptor1 === faceDescriptor2; // Example logic
};
