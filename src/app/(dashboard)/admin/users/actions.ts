'use server';

import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This is a private utility function to ensure Firebase Admin is initialized only once.
function getFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // In a managed environment, initializeApp() should be called without arguments.
  // It automatically discovers the credentials from the environment.
  // We will check for explicit environment variables first, as suggested for some environments.
  try {
     if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      return initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key needs to be parsed correctly.
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Fallback for managed environments where GOOGLE_APPLICATION_CREDENTIALS is set
      return initializeApp();
    }
  } catch (error: any) {
    console.error("Failed to initialize Firebase Admin SDK.", error);
    // This generic error is better than a specific service account error.
    throw new Error("Could not connect to Firebase services on the server. Please contact support.");
  }
}

type UserRole = 'Employee' | 'Admin' | 'Super Admin' | 'College' | 'Industry';

interface CreateUserPayload {
  email: string;
  password?: string;
  displayName: string;
  role: UserRole;
  phone?: string | null;
  photoUrl?: string | null;
  surname?: string | null;
  collegeData?: Record<string, any>;
  industryData?: Record<string, any>;
}

async function generateEmployeeId(
  name: string,
  surname: string
) {
  const date = new Date();
  const initials = (name.charAt(0) + surname.charAt(0)).toUpperCase();
  const datePart = `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
  return `ESG${datePart}${initials}`;
}


export async function createNewUser(payload: CreateUserPayload): Promise<{ uid?: string; error?: string }> {
  try {
    const adminApp = getFirebaseAdmin();
    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    const {
      email,
      password,
      displayName,
      role,
      photoUrl,
      phone,
      surname,
    } = payload;
    
    // Password must exist for user creation via email/password
    if (!password) {
        throw new Error("A password is required to create a new user.");
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      photoURL: photoUrl,
    });

    const collections: { [key: string]: string } = {
      Employee: 'employees',
      Admin: 'admins',
      'Super Admin': 'super_admins',
      College: 'colleges',
      Industry: 'industries',
    };
    const roleCollections: { [key: string]: string } = {
      Employee: 'roles_employee',
      Admin: 'roles_admin',
      'Super Admin': 'roles_super_admin',
      College: 'roles_college',
      Industry: 'roles_industry',
    };

    const collectionName = collections[role];
    const roleCollectionName = roleCollections[role];

    if (!collectionName || !roleCollectionName) {
      throw new Error('Invalid role selected');
    }

    // Main user profile document
    const userDocRef = db.collection(collectionName).doc(userRecord.uid);
    let userProfile: any = {
      id: userRecord.uid,
      name: displayName,
      phone: phone || '',
      email: email,
      lastLogin: new Date().toISOString(),
      isVerified: true, 
      photoUrl: photoUrl || ''
    };

    if (role === 'Employee' && surname) {
      userProfile.surname = surname;
      userProfile.employeeId = await generateEmployeeId(displayName, surname);
    } else if ((role === 'Admin' || role === 'Super Admin') && surname) {
        userProfile.surname = surname;
    }


    await userDocRef.set(userProfile, { merge: true });

    // Role mapping document
    const roleMapDocRef = db.collection(roleCollectionName).doc(userRecord.uid);
    await roleMapDocRef.set({ uid: userRecord.uid }, { merge: true });
    
    // Handle sub-collection data for College or Industry
    if (role === 'College' && payload.collegeData) {
        const collegeDataDocRef = db.collection(`colleges/${userRecord.uid}/collegeData`).doc(userRecord.uid);
        await collegeDataDocRef.set({
            ...payload.collegeData,
            id: userRecord.uid,
            collegeId: userRecord.uid,
        }, { merge: true });
    }
    
    if (role === 'Industry' && payload.industryData) {
        const industryDataDocRef = db.collection(`industries/${userRecord.uid}/industryData`).doc(userRecord.uid);
        await industryDataDocRef.set({
            ...payload.industryData,
            id: userRecord.uid,
            industryId: userRecord.uid,
        }, { merge: true });
    }

    return { uid: userRecord.uid };
  } catch (error: any) {
    console.error('User creation failed:', error.message);
    // Return a structured error to the client
    return { error: error.message };
  }
}
