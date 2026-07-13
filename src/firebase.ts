import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingEnvVars.join(', ')}`);
}

const firebaseApp = initializeApp(requiredEnvVars);

export const ADMIN_EMAIL = 'veronica.willnat@gmail.com';
export const auth = getAuth(firebaseApp);
