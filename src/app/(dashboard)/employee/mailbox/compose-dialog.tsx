'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PenSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendMessageToAdmin } from './actions';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ComposeDialog() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');

  const adminsQuery = useMemoFirebase(() => {
    if (!db) return null;
    // Query the 'admins' collection to get a list of all administrators
    return query(collection(db, 'admins'));
  }, [db]);

  const { data: admins, isLoading: adminsLoading } = useCollection(adminsQuery);

  const handleSend = async () => {
    if (!user || !user.email) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to send a message.' });
      return;
    }
    if (!selectedAdmin || !subject || !body) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please select a recipient and fill out the subject and body.' });
        return;
    }
    setIsLoading(true);
    try {
      const selectedAdminData = admins?.find(admin => admin.id === selectedAdmin);
      if (!selectedAdminData) {
        throw new Error('Selected admin not found.');
      }

      await sendMessageToAdmin({
        senderId: user.uid,
        senderEmail: user.email,
        receiverId: selectedAdminData.id,
        receiverEmail: selectedAdminData.email,
        subject,
        body,
      });
      toast({ title: 'Success', description: 'Your message has been sent.' });
      setIsOpen(false);
      setSubject('');
      setBody('');
      setSelectedAdmin('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to Send', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PenSquare className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>Compose a new message to an administrator.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To
            </Label>
            <Select onValueChange={setSelectedAdmin} value={selectedAdmin}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={adminsLoading ? "Loading admins..." : "Select an admin"} />
                </SelectTrigger>
                <SelectContent>
                    {!adminsLoading && admins && admins.map(admin => (
                        <SelectItem key={admin.id} value={admin.id}>
                           {admin.name} {admin.surname} ({admin.email})
                        </SelectItem>
                    ))}
                     {!adminsLoading && admins?.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground p-4">No admins found.</div>
                    )}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              className="min-h-[200px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSend} disabled={isLoading || adminsLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}