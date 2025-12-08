'use server';

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This function ensures the Firebase Admin SDK is initialized only once.
function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // This is the crucial part: it replaces the literal "\\n" from the .env file with actual newline characters.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    // In a managed hosting environment, initialization might work without explicit credentials.
    try {
      console.log("Attempting to initialize Firebase Admin with default credentials...");
      return initializeApp();
    } catch (e) {
        console.error("Default Firebase Admin initialization failed. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables are set correctly.", e);
        throw new Error("Firebase Admin SDK credentials are not configured correctly.");
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
  });
}

const adminApp = initializeAdminApp();
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
