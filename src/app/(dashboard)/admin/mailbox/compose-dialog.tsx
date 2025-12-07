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
import { sendMessageToEmployee } from './actions';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ComposeDialog() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const employeesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'employees'));
  }, [db]);

  const { data: employees, isLoading: employeesLoading } = useCollection(employeesQuery);

  const handleSend = async () => {
    if (!user || !user.email) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to send a message.' });
      return;
    }
    if (!selectedEmployee || !subject || !body) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please select a recipient and fill out the subject and body.' });
        return;
    }
    setIsLoading(true);
    try {
      const selectedEmployeeData = employees?.find(emp => emp.id === selectedEmployee);
      if (!selectedEmployeeData) {
        throw new Error('Selected employee not found.');
      }

      await sendMessageToEmployee({
        senderId: user.uid,
        senderEmail: user.email,
        receiverId: selectedEmployeeData.id,
        receiverEmail: selectedEmployeeData.email,
        subject,
        body,
      });
      toast({ title: 'Success', description: 'Your message has been sent.' });
      setIsOpen(false);
      setSubject('');
      setBody('');
      setSelectedEmployee('');
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
          <DialogDescription>Compose a new message to an employee.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To
            </Label>
            <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={employeesLoading ? "Loading employees..." : "Select an employee"} />
                </SelectTrigger>
                <SelectContent>
                    {!employeesLoading && employees && employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                           {employee.name} {employee.surname} ({employee.email})
                        </SelectItem>
                    ))}
                     {!employeesLoading && employees?.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground p-4">No employees found.</div>
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
          <Button onClick={handleSend} disabled={isLoading || employeesLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
