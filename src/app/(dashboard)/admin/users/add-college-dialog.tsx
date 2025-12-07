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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

const formSchema = z
  .object({
    collegeName: z.string().min(1, 'College name is required.'),
    email: z.string().email('Invalid email address.'),
    phone: z.string().min(10, 'Must be at least 10 digits.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
    photoUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
    industrialVisit: z.string().optional(),
    sem: z.string().optional(),
    ws: z.string().optional(),
    tt: z.string().optional(),
    international: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function AddCollegeDialog() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a temporary auth instance for user creation
  const tempAuth = getAuth(getApp());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collegeName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      photoUrl: '',
      industrialVisit: '',
      sem: '',
      ws: '',
      tt: '',
      international: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.collegeName,
        photoURL: values.photoUrl,
      });

      // Create college profile document
      const collegeDocRef = doc(db, 'colleges', user.uid);
      await setDoc(collegeDocRef, {
        id: user.uid,
        name: values.collegeName,
        email: values.email,
        phone: values.phone,
        lastLogin: new Date().toISOString(),
      });
      
      // Create role mapping document
      const roleDocRef = doc(db, 'roles_college', user.uid);
      await setDoc(roleDocRef, { uid: user.uid });

      // Create college data sub-collection document
      const collegeDataDocRef = doc(db, `colleges/${user.uid}/collegeData`, user.uid);
      await setDoc(collegeDataDocRef, {
        id: user.uid,
        collegeId: user.uid,
        industrialVisit: values.industrialVisit || '',
        sem: values.sem || '',
        ws: values.ws || '',
        tt: values.tt || '',
        international: values.international || '',
        photoUrl: values.photoUrl || '',
        // These fields are in the schema but not in the form, setting default
        authorizedName: values.collegeName,
        authorizedEmail: values.email,
        authorizedMobile: values.phone,
      });
      
      // Since we used a temporary auth instance, we should sign this user out
      // so the admin's session is not disturbed.
      if (tempAuth.currentUser?.uid === user.uid) {
        await tempAuth.signOut();
      }

      toast({
        title: 'College Added',
        description: `${values.collegeName} has been successfully created.`,
      });
      form.reset();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating college',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add College
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New College</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new college user account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto p-1">
              <FormField control={form.control} name="collegeName" render={({ field }) => (
                <FormItem><FormLabel>College Name</FormLabel><FormControl><Input placeholder="e.g., State University" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem><FormLabel>Profile Photo URL</FormLabel><FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contact@stateuni.edu" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="987-654-3210" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              
              <h4 className="text-md font-semibold pt-2 border-t mt-2">Program Details</h4>
              
              <FormField control={form.control} name="industrialVisit" render={({ field }) => (
                <FormItem><FormLabel>Industrial Visit</FormLabel><FormControl><Textarea placeholder="Details about industrial visits..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="sem" render={({ field }) => (
                <FormItem><FormLabel>SEM</FormLabel><FormControl><Textarea placeholder="Details about SEM..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="ws" render={({ field }) => (
                <FormItem><FormLabel>W/S (Workshop)</FormLabel><FormControl><Textarea placeholder="Details about workshops..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="tt" render={({ field }) => (
                <FormItem><FormLabel>TT</FormLabel><FormControl><Textarea placeholder="Details about TT..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="international" render={({ field }) => (
                <FormItem><FormLabel>International Programs</FormLabel><FormControl><Textarea placeholder="Details about international programs..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save College
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
