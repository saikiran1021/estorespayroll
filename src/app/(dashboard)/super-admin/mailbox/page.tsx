'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function SuperAdminMailboxPage() {
  const db = useFirestore();

  const messagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
  }, [db]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Mail className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Global Mailbox</CardTitle>
              <CardDescription>
                View all messages sent across the eStores WorkHub system.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">{message.senderEmail}</TableCell>
                      <TableCell>{message.receiverEmail}</TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>
                        {message.timestamp 
                          ? format(message.timestamp.toDate(), "PPP 'at' p") 
                          : 'No date'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No messages found in the system.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/super-admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
