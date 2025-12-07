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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

const formSchema = z
  .object({
    industryName: z.string().min(1, 'Industry name is required.'),
    email: z.string().email('Invalid email address.'),
    phone: z.string().min(10, 'Must be at least 10 digits.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
    photoUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
    type: z.string().min(1, 'Industry type is required.'),
    advisorName: z.string().min(1, "Advisor's name is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function AddIndustryDialog() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const tempAuth = getAuth(getApp());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industryName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      photoUrl: '',
      type: '',
      advisorName: '',
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
        displayName: values.industryName,
        photoURL: values.photoUrl,
      });

      // Create industry profile document
      const industryDocRef = doc(db, 'industries', user.uid);
      await setDoc(industryDocRef, {
        id: user.uid,
        name: values.industryName,
        email: values.email,
        phone: values.phone,
        lastLogin: new Date().toISOString(),
      });
      
      // Create role mapping document
      const roleDocRef = doc(db, 'roles_industry', user.uid);
      await setDoc(roleDocRef, { uid: user.uid });

      // Create industry data sub-collection document
      const industryDataDocRef = doc(db, `industries/${user.uid}/industryData`, user.uid);
      await setDoc(industryDataDocRef, {
        id: user.uid,
        industryId: user.uid,
        type: values.type,
        dates: serverTimestamp(), // Placeholder, as not in form
        department: '', // Placeholder
        numStudents: 0, // Placeholder
        advisorName: values.advisorName,
        contactNum: values.phone,
        email: values.email,
        photoUrl: values.photoUrl || '',
      });
      
      if (tempAuth.currentUser?.uid === user.uid) {
        await tempAuth.signOut();
      }

      toast({
        title: 'Industry Added',
        description: `${values.industryName} has been successfully created.`,
      });
      form.reset();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating industry',
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
          Add Industry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Industry</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new industry partner account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto p-1">
               <h4 className="text-md font-semibold pt-2">Industry Details</h4>
              <FormField control={form.control} name="industryName" render={({ field }) => (
                <FormItem><FormLabel>Industry Name</FormLabel><FormControl><Input placeholder="e.g., Tech Corp" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem><FormLabel>Profile Photo URL</FormLabel><FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Login Email</FormLabel><FormControl><Input type="email" placeholder="contact@techcorp.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input placeholder="987-654-3210" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              
              <h4 className="text-md font-semibold pt-4 border-t mt-4">Additional Information</h4>
               <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Industry Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select an industry type..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="IT">Information Technology</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                <FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="advisorName" render={({ field }) => (
                <FormItem><FormLabel>Advisor Name</FormLabel><FormControl><Input placeholder="e.g., Mr. John Smith" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Industry
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
