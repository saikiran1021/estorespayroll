'use server';

import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

interface CreateUserPayload {
  email: string;
  password?: string;
  displayName: string;
  role: 'Employee' | 'Admin' | 'Super Admin' | 'College' | 'Industry';
  phone?: string;
  surname?: string;
}

export async function createNewUser(payload: CreateUserPayload) {
  try {
    if (!payload.password) {
        throw new Error('Password is required.');
    }
    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: payload.email,
      password: payload.password,
      displayName: payload.role === 'Employee' || payload.role === 'Admin' || payload.role === 'Super Admin' 
        ? `${payload.displayName} ${payload.surname}` 
        : payload.displayName,
    });

    const uid = userRecord.uid;
    const roleCollectionMap = {
      Employee: 'employees',
      Admin: 'admins',
      'Super Admin': 'super_admins',
      College: 'colleges',
      Industry: 'industries',
    };

    const profileCollection = roleCollectionMap[payload.role];
    const roleFirestoreCollection = `roles_${payload.role.toLowerCase().replace(' ', '_')}`;

    // 2. Create user profile in Firestore
    const userProfile: any = {
      id: uid,
      name: payload.displayName,
      email: payload.email,
      phone: payload.phone || '',
      lastLogin: new Date().toISOString(),
      isVerified: true, // Assuming verification for self-signup
    };

    if (payload.surname) {
      userProfile.surname = payload.surname;
    }
    if (payload.role === 'Employee') {
        userProfile.employeeId = `ESG${Math.floor(100000 + Math.random() * 900000)}`;
    }


    await adminDb.collection(profileCollection).doc(uid).set(userProfile);

    // 3. Create role mapping in Firestore
    await adminDb.collection(roleFirestoreCollection).doc(uid).set({ uid });

    return { uid };

  } catch (error: any) {
    console.error('Error creating new user:', error);
    return {
      error: error.message || 'An unknown error occurred during user creation.',
    };
  }
}
