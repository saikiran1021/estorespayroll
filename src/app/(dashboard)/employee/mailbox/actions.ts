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

  return addDoc(messagesRef, messageData)
    .catch((error) => {
        const contextualError = new FirestorePermissionError({
            path: messagesRef.path,
            operation: 'create',
            requestResourceData: messageData
        });
        errorEmitter.emit('permission-error', contextualError);
        // Re-throw the original error to be caught by the caller
        throw error;
    });
}

    