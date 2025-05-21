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

export const compareFaces = (liveDescriptor, storedDescriptor) => {
  // Example: Cosine similarity calculation
  let dotProduct = 0;
  let liveMagnitude = 0;
  let storedMagnitude = 0;

  for (let i = 0; i < liveDescriptor.length; i++) {
    dotProduct += liveDescriptor[i] * storedDescriptor[i];
    liveMagnitude += liveDescriptor[i] ** 2;
    storedMagnitude += storedDescriptor[i] ** 2;
  }

  const similarity =
    dotProduct / (Math.sqrt(liveMagnitude) * Math.sqrt(storedMagnitude));

  console.log("Cosine Similarity pointer:", similarity); // Log similarity for debugging
  // Adjust the threshold based on your requirements
  //return similarity > 0.7; // Adjust threshold (e.g., 0.5-0.7)
  return similarity;
};
