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
import { doc, setDoc } from 'firebase/firestore';
import { createUser } from '@/ai/flows/create-user';
import type { CreateUserInput } from '@/ai/flows/create-user.types';


const formSchema = z
  .object({
    collegeName: z.string().min(1, 'College name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
    photoUrl: z.string().url().or(z.literal('')).optional(),
    authorizedName: z.string().min(1, 'Authorized person name is required.'),
    authorizedMobile: z.string().min(1, 'Mobile number is required.'),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collegeName: '',
      email: '',
      password: '',
      confirmPassword: '',
      photoUrl: '',
      authorizedName: '',
      authorizedMobile: '',
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
      const createUserInput: CreateUserInput = {
        email: values.email,
        password: values.password,
        displayName: values.collegeName,
        role: 'College',
        phone: values.authorizedMobile,
        photoUrl: values.photoUrl
      };

      const newUser = await createUser(createUserInput);

      if (!db) {
        throw new Error('Firestore is not initialized');
      }

      const collegeDataDocRef = doc(db, `colleges/${newUser.uid}/collegeData`, newUser.uid);
      await setDoc(collegeDataDocRef, {
        id: newUser.uid,
        collegeId: newUser.uid,
        photoUrl: values.photoUrl || '',
        authorizedName: values.authorizedName || '',
        authorizedEmail: values.email, // Use login email for authorized email
        authorizedMobile: values.authorizedMobile || '',
        industrialVisit: values.industrialVisit || '',
        sem: values.sem || '',
        ws: values.ws || '',
        tt: values.tt || '',
        international: values.international || '',
      });

      toast({
        title: 'College Added',
        description: `${values.collegeName} has been successfully created.`,
      });
      form.reset();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error creating college:", error);
      toast({
        variant: 'destructive',
        title: 'Error creating college',
        description: error.message || 'An unexpected error occurred.',
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
               <h4 className="text-md font-semibold pt-2">College Details (Required)</h4>
              <FormField control={form.control} name="collegeName" render={({ field }) => (
                <FormItem><FormLabel>College Name</FormLabel><FormControl><Input placeholder="e.g., State University" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem><FormLabel>Photo URL</FormLabel><FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

              <h4 className="text-md font-semibold pt-2">Authorized Person (Required)</h4>
               <FormField control={form.control} name="authorizedName" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Dr. Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="authorizedMobile" render={({ field }) => (
                <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="123-456-7890" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

              <h4 className="text-md font-semibold pt-2">Login Credentials (Required)</h4>
               <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Login Email</FormLabel><FormControl><Input type="email" placeholder="contact@stateuni.edu" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

              <h4 className="text-md font-semibold pt-4 border-t mt-4">Additional Information (Optional)</h4>
              <FormField control={form.control} name="industrialVisit" render={({ field }) => (
                <FormItem><FormLabel>Industrial Visit</FormLabel><FormControl><Textarea placeholder="Details about industrial visits..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="sem" render={({ field }) => (
                <FormItem><FormLabel>SEM</FormLabel><FormControl><Textarea placeholder="Details about SEM..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="tt" render={({ field }) => (
                <FormItem><FormLabel>TT</FormLabel><FormControl><Textarea placeholder="Details about TT..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="ws" render={({ field }) => (
                <FormItem><FormLabel>W/S (Workshop)</FormLabel><FormControl><Textarea placeholder="Details about workshops..." {...field} /></FormControl><FormMessage /></FormItem>
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
