import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
        industryName,
        email,
        password,
        phone,
        photoUrl,
        type,
        advisorName
    } = body;

    if (!email || !password || !industryName) {
        return NextResponse.json({ error: 'Email, password, and industry name are required.' }, { status: 400 });
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: industryName,
      photoURL: photoUrl,
    });

    // Create industry profile in Firestore
    const industryProfile = {
      id: userRecord.uid,
      name: industryName,
      phone: phone || '',
      email: email,
      lastLogin: new Date().toISOString(),
      isVerified: true,
      photoUrl: photoUrl || ''
    };
    await adminDb.collection('industries').doc(userRecord.uid).set(industryProfile);

    // Create role mapping
    await adminDb.collection('roles_industry').doc(userRecord.uid).set({ uid: userRecord.uid });

    // Create industry data subcollection document
    const industryData = {
        id: userRecord.uid,
        industryId: userRecord.uid,
        type: type || '',
        dates: new Date().toISOString(),
        department: '', // Not in form, default
        numStudents: 0, // Not in form, default
        advisorName: advisorName || '',
        contactNum: phone || '',
        email: email,
        photoUrl: photoUrl || ''
    };
    await adminDb.collection('industries').doc(userRecord.uid).collection('industryData').doc(userRecord.uid).set(industryData);

    return NextResponse.json({ uid: userRecord.uid });
  } catch (err) {
    console.error('Firebase Admin error creating industry:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
