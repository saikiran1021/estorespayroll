'use server';
/**
 * @fileOverview A secure flow for creating new users in Firebase.
 */

import { ai } from '@/ai/genkit';
import {
  CreateUserInputSchema,
  CreateUserOutputSchema,
} from './create-user.types';
import type { CreateUserInput, CreateUserOutput } from './create-user.types';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized only once.
let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}


async function generateEmployeeId(
  db: FirebaseFirestore.Firestore,
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

export const createUserFlow = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (payload) => {
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

    const userDocRef = db.collection(collectionName).doc(userRecord.uid);
    let userData: any = {
      id: userRecord.uid,
      name: displayName,
      phone: phone || '',
      email: email,
      lastLogin: new Date().toISOString(),
      isVerified: false,
    };

    if (role === 'Employee' && surname) {
      userData.surname = surname;
      userData.name = displayName;
      userData.employeeId = await generateEmployeeId(
        db,
        displayName,
        surname
      );
    } else if (role === 'Admin' || role === 'Super Admin') {
      if (surname) {
        userData.surname = surname;
      }
      userData.name = displayName;
    }

    await userDocRef.set(userData, { merge: true });

    const roleMapDocRef = db.collection(roleCollectionName).doc(userRecord.uid);
    await roleMapDocRef.set({ uid: userRecord.uid }, { merge: true });

    return {
      uid: userRecord.uid,
      email: userRecord.email!,
      displayName: userRecord.displayName!,
    };
  }
);

export async function createUser(
  input: CreateUserInput
): Promise<CreateUserOutput> {
  return createUserFlow(input);
}
