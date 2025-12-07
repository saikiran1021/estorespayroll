'use server';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getSdks } from '@/firebase/index';
import { FirestorePermissionError, errorEmitter } from '@/firebase/errors';

interface MessagePayload {
  senderId: string;
  senderEmail: string;
  receiverId: string;
  receiverEmail: string;
  subject: string;
  body: string;
}

export async function sendMessageToAdmin(payload: MessagePayload) {
  const { firestore } = getSdks();
  const messagesRef = collection(firestore, 'messages');

  const messageData = {
    ...payload,
    timestamp: serverTimestamp(),
    isRead: false,
  };

  // The 'addDoc' function returns a promise that resolves with a DocumentReference.
  // We don't need to await it here; we just handle the potential error.
  addDoc(messagesRef, messageData)
    .catch((error) => {
        const contextualError = new FirestorePermissionError({
            path: messagesRef.path,
            operation: 'create',
            requestResourceData: messageData
        });
        errorEmitter.emit('permission-error', contextualError);
        
        // It's important to re-throw the error so the calling client code knows the operation failed.
        // The global error listener will catch and display the detailed error for debugging,
        // while the client can show a user-friendly message.
        throw error;
    });
}

    