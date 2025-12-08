'use server';

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This function ensures the Firebase Admin SDK is initialized only once.
function initializeAdminApp(): App {
  if (getApps().length > 0) {
    const existingApp = getApps().find(app => app.name === 'firebase-admin-app');
    if (existingApp) {
      return existingApp;
    }
  }

  // Retrieve credentials from environment variables.
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // The private key from environment variables often has escaped newlines.
  // This line replaces "\\n" with actual newline characters "\n".
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    // In a managed hosting environment (like Firebase App Hosting or Cloud Run),
    // initialization might work without explicit credentials by using Application Default Credentials.
    try {
      console.log("Attempting to initialize Firebase Admin with default credentials...");
      return initializeApp({}, 'firebase-admin-app');
    } catch (e) {
      console.error("Default Firebase Admin initialization failed. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables are set correctly.", e);
      // If default also fails, it's a fatal configuration error.
      throw new Error("Firebase Admin SDK credentials are not configured correctly in the environment.");
    }
  }

  // Initialize with the explicit credentials from environment variables.
  console.log("Initializing Firebase Admin with explicit credentials...");
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  }, 'firebase-admin-app');
}

// Initialize the app and export the SDK services.
const adminApp = initializeAdminApp();
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
