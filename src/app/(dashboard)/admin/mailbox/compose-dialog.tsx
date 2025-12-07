'use client';

import React, { useState, useMemo } from 'react';
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
import { sendMessageToEmployee } from './actions';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserOption {
    id: string;
    email: string;
    label: string;
    role: string;
}

export function ComposeDialog() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');

  // Queries for all user types
  const employeesQuery = useMemoFirebase(() => db ? query(collection(db, 'employees')) : null, [db]);
  const adminsQuery = useMemoFirebase(() => db ? query(collection(db, 'admins')) : null, [db]);
  const superAdminsQuery = useMemoFirebase(() => db ? query(collection(db, 'super_admins')) : null, [db]);
  const collegesQuery = useMemoFirebase(() => db ? query(collection(db, 'colleges')) : null, [db]);
  const industriesQuery = useMemoFirebase(() => db ? query(collection(db, 'industries')) : null, [db]);

  const { data: employees, isLoading: l1 } = useCollection(employeesQuery);
  const { data: admins, isLoading: l2 } = useCollection(adminsQuery);
  const { data: superAdmins, isLoading: l3 } = useCollection(superAdminsQuery);
  const { data: colleges, isLoading: l4 } = useCollection(collegesQuery);
  const { data: industries, isLoading: l5 } = useCollection(industriesQuery);

  const isUsersLoading = l1 || l2 || l3 || l4 || l5;

  const allUsers = useMemo<UserOption[]>(() => {
    const users: UserOption[] = [];
    employees?.forEach(u => users.push({ id: u.id, email: u.email, label: `${u.name} ${u.surname} (${u.email})`, role: 'Employee' }));
    admins?.forEach(u => users.push({ id: u.id, email: u.email, label: `${u.name} ${u.surname} (${u.email})`, role: 'Admin' }));
    superAdmins?.forEach(u => users.push({ id: u.id, email: u.email, label: `${u.name} ${u.surname} (${u.email})`, role: 'Super Admin' }));
    colleges?.forEach(u => users.push({ id: u.id, email: u.email, label: `${u.name} (${u.email})`, role: 'College' }));
    industries?.forEach(u => users.push({ id: u.id, email: u.email, label: `${u.name} (${u.email})`, role: 'Industry' }));
    return users.sort((a,b) => a.label.localeCompare(b.label));
  }, [employees, admins, superAdmins, colleges, industries]);

  const handleSend = async () => {
    if (!user || !user.email) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to send a message.' });
      return;
    }
    if (!selectedRecipient || !subject || !body) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please select a recipient and fill out the subject and body.' });
        return;
    }
    setIsLoading(true);
    try {
      const recipientData = allUsers.find(u => u.id === selectedRecipient);
      if (!recipientData) {
        throw new Error('Selected recipient not found.');
      }

      await sendMessageToEmployee({
        senderId: user.uid,
        senderEmail: user.email,
        receiverId: recipientData.id,
        receiverEmail: recipientData.email,
        subject,
        body,
      });
      toast({ title: 'Success', description: 'Your message has been sent.' });
      setIsOpen(false);
      setSubject('');
      setBody('');
      setSelectedRecipient('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to Send', description: "Could not send message. Check permissions." });
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
          <DialogDescription>Compose a new message to any user in the system.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To
            </Label>
            <Select onValueChange={setSelectedRecipient} value={selectedRecipient}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={isUsersLoading ? "Loading users..." : "Select a recipient"} />
                </SelectTrigger>
                <SelectContent>
                    {!isUsersLoading && allUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                           {u.label}
                        </SelectItem>
                    ))}
                     {!isUsersLoading && allUsers?.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground p-4">No users found.</div>
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
          <Button onClick={handleSend} disabled={isLoading || isUsersLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
