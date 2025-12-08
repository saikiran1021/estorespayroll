'use server';

import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

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

export async function createNewUser(payload: CreateUserPayload): Promise<{ uid?: string; error?: string }> {
  try {
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

    const userRecord = await adminAuth.createUser({
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
    const userDocRef = adminDb.collection(collectionName).doc(userRecord.uid);
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
      // Simple employee ID, can be made more robust later
      userProfile.employeeId = `EMP-${userRecord.uid.substring(0, 6).toUpperCase()}`;
    } else if ((role === 'Admin' || role === 'Super Admin') && surname) {
        userProfile.surname = surname;
    }


    await userDocRef.set(userProfile, { merge: true });

    // Role mapping document
    const roleMapDocRef = adminDb.collection(roleCollectionName).doc(userRecord.uid);
    await roleMapDocRef.set({ uid: userRecord.uid }, { merge: true });
    
    // Handle sub-collection data for College or Industry
    if (role === 'College' && payload.collegeData) {
        const collegeDataDocRef = adminDb.collection(`colleges/${userRecord.uid}/collegeData`).doc(userRecord.uid);
        await collegeDataDocRef.set({
            ...payload.collegeData,
            id: userRecord.uid,
            collegeId: userRecord.uid,
        }, { merge: true });
    }
    
    if (role === 'Industry' && payload.industryData) {
        const industryDataDocRef = adminDb.collection(`industries/${userRecord.uid}/industryData`).doc(userRecord.uid);
        await industryDataDocRef.set({
            ...payload.industryData,
            id: userRecord.uid,
            industryId: userRecord.uid,
        }, { merge: true });
    }

    return { uid: userRecord.uid };
  } catch (error: any) {
    console.error('User creation failed:', error);
    // Return a structured error to the client
    return { error: error.message || "An unknown error occurred during user creation." };
  }
}
