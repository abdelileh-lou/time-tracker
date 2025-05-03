import * as faceapi from "face-api.js";

export const loadModels = async () => {
  const MODEL_URL = "/models";
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
};

export const detectFaces = async (videoElement) => {
  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5,
  });

  return faceapi
    .detectAllFaces(videoElement, options)
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender()
    .withFaceDescriptors();
};

export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
  return faceapi.euclideanDistance(descriptor1, descriptor2) < threshold;
};
