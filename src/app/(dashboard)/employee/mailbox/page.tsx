'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import MailDisplay from './mail-display';
import { ComposeDialog } from './compose-dialog';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import React from 'react';

export default function EmployeeMailboxPage() {
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

  const { data: receivedMail, isLoading: receivedLoading } = useCollection(receivedMailQuery);
  const { data: sentMail, isLoading: sentLoading } = useCollection(sentMailQuery);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>My Mailbox</CardTitle>
                <CardDescription>
                  Communicate with your administrators.
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
                isLoading={receivedLoading || sentLoading}
            />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/employee/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    