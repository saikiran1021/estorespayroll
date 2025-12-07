'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import MailDisplay from './mail-display';
import { ComposeDialog } from './compose-dialog';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function AdminMailboxPage() {
  const { user } = useUser();
  const db = useFirestore();

  const receivedMailQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'messages'),
      where('receiverId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
  }, [user, db]);

  const sentMailQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'messages'),
      where('senderId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
  }, [user, db]);

  const { data: receivedMail, isLoading: isLoadingReceived } = useCollection(receivedMailQuery);
  const { data: sentMail, isLoading: isLoadingSent } = useCollection(sentMailQuery);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>My Mailbox</CardTitle>
                <CardDescription>
                  Communicate with employees and manage your messages.
                </CardDescription>
              </div>
            </div>
            <ComposeDialog />
          </div>
        </CardHeader>
        <CardContent>
          <MailDisplay
            receivedMail={receivedMail || []}
            sentMail={sentMail || []}
            isLoading={isLoadingReceived || isLoadingSent}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
