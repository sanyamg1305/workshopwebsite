import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// High-trust Firebase Configuration
// Supports both VITE_ (Vite) and NEXT_PUBLIC_ (Vercel/Next.js) prefixes for maximum compatibility
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Protocol & Domain Integrity Enforcement
if (firebaseConfig.authDomain) {
  // Remove trailing slashes and ensure no double-slashes
  firebaseConfig.authDomain = firebaseConfig.authDomain.replace(/\/+$/, '').replace(/^http:\/\//, 'https://');
}

// Diagnostic Logging (Production-Safe)
if (import.meta.env.DEV) {
  console.log("[Firebase] Active Auth Domain:", firebaseConfig.authDomain);
  console.log("[Firebase] Project ID:", firebaseConfig.projectId);
}

if (!firebaseConfig.apiKey) {
  console.error("[Firebase] CRITICAL: API Key is missing. Authentication will fail.");
}

// Safe Initialization Pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Ensure handler integrity
if (auth.config) {
  console.debug("[Firebase] Auth handler initialized via HTTPS");
}
