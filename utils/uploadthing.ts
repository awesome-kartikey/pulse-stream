// src/utils/uploadthing.ts
import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers // <-- Use generateReactHelpers for the hook
} from "@uploadthing/react";

// Define the URL for your backend. Use an environment variable.
const backendUrl = process.env.NEXT_PUBLIC_UPLOADTHING_URL || "http://localhost:8000/api/uploadthing";

// --- Generate Components with URL Config ---
// Note: The docs are a bit ambiguous if generateUploadButton/Dropzone
// accept the URL directly or within an options object like generateReactHelpers.
// Let's assume they accept it directly for now based on the parameter list.
// If this causes errors later, we might need to adjust.
export const UploadButton = generateUploadButton<any>({ url: backendUrl }); // Pass URL config
export const UploadDropzone = generateUploadDropzone<any>({ url: backendUrl }); // Pass URL config

// --- Generate Hook and Helpers with URL Config ---
export const { useUploadThing, uploadFiles } = // Destructure the generated hook and helper
  generateReactHelpers<any>({ // Pass options object HERE
    url: backendUrl, // <-- Provide the URL during generation
  });

// Ensure you export useUploadThing correctly
  
  // --- Option 2 (Stricter Types - uncomment and define if needed later) ---
  // export type ClientFileRouter = {
  //   imageUploader: /* ... define expected route config ... */;
  // };
  // export const UploadButton = generateUploadButton<ClientFileRouter>();
  // export const UploadDropzone = generateUploadDropzone<ClientFileRouter>();
  // export const useUploadThing = generateUploader<ClientFileRouter>();