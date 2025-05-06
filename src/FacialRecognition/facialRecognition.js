// import * as faceapi from "face-api.js";

// export const loadModels = async () => {
//   const MODEL_URL = "/models";
//   await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
//   await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
//   await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
//   await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
//   await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
//   await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
// };

// export const detectFaces = async (videoElement) => {
//   const options = new faceapi.SsdMobilenetv1Options({
//     minConfidence: 0.5,
//   });

//   return faceapi
//     .detectAllFaces(videoElement, options)
//     .withFaceLandmarks()
//     .withFaceExpressions()
//     .withAgeAndGender()
//     .withFaceDescriptors();
// };

// export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
//   return faceapi.euclideanDistance(descriptor1, descriptor2) < threshold;
// };
// Updated facialRecognition.js - Add these utility functions
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

// Updated compareFaces function to handle different array types
// export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
//   try {
//     // Convert arrays to Float32Array if they aren't already
//     const desc1 =
//       descriptor1 instanceof Float32Array
//         ? descriptor1
//         : new Float32Array(descriptor1);

//     const desc2 =
//       descriptor2 instanceof Float32Array
//         ? descriptor2
//         : new Float32Array(descriptor2);

//     // Check array lengths before comparison
//     if (desc1.length !== desc2.length) {
//       console.error(
//         `Array length mismatch: ${desc1.length} vs ${desc2.length}`,
//       );
//       return false;
//     }

//     // Perform comparison
//     const distance = faceapi.euclideanDistance(desc1, desc2);
//     const isMatch = distance < threshold;

//     // Log the result as requested
//     if (isMatch) {
//       console.log("Face verification: MATCH", { distance, threshold });
//     } else {
//       // No console log for non-matches as requested
//     }

//     return isMatch;
//   } catch (error) {
//     console.error("Error comparing faces:", error);
//     return false;
//   }
// };

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
  return similarity > 0.7; // Adjust threshold (e.g., 0.5-0.7)
};
