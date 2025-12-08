import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      collegeName,
      photoUrl,
      authorizedName,
      authorizedMobile,
      industrialVisit,
      sem,
      tt,
      ws,
      international,
    } = body;
    
    if (!password || !email || !collegeName) {
        return NextResponse.json({ error: 'Email, password, and college name are required.' }, { status: 400 });
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: collegeName,
      photoURL: photoUrl,
    });

    // Create college profile in Firestore
    const collegeProfile = {
      id: userRecord.uid,
      name: collegeName,
      phone: authorizedMobile || '',
      email: email,
      lastLogin: new Date().toISOString(),
      isVerified: true,
      photoUrl: photoUrl || ''
    };
    await adminDb.collection('colleges').doc(userRecord.uid).set(collegeProfile);

    // Create role mapping
    await adminDb.collection('roles_college').doc(userRecord.uid).set({ uid: userRecord.uid });

    // Create college data subcollection document
    const collegeData = {
        id: userRecord.uid,
        collegeId: userRecord.uid,
        authorizedName: authorizedName || '',
        authorizedEmail: email,
        authorizedMobile: authorizedMobile || '',
        industrialVisit: industrialVisit || '',
        sem: sem || '',
        ws: ws || '',
        tt: tt || '',
        international: international || '',
        photoUrl: photoUrl || '',
    };
    await adminDb.collection('colleges').doc(userRecord.uid).collection('collegeData').doc(userRecord.uid).set(collegeData);


    return NextResponse.json({ uid: userRecord.uid });
  } catch (err) {
    console.error('Firebase Admin error creating college:', err);
    let errorMessage = 'An unknown error occurred.';
    if (err instanceof Error) {
        errorMessage = err.message;
    } else if (typeof err === 'object' && err && 'message' in err) {
        errorMessage = (err as { message: string }).message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
