'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  industrialVisit: z.string().min(1, 'This field is required.'),
  sem: z.string().min(1, 'This field is required.'),
  ws: z.string().min(1, 'This field is required.'),
  domesticProgram: z.string().min(1, 'This field is required.'),
  international: z.string().min(1, 'This field is required.'),
  authorizedName: z.string().min(1, 'This field is required.'),
  authorizedEmail: z.string().email('Invalid email address.'),
  authorizedMobile: z.string().min(10, 'Must be at least 10 digits.'),
});

export default function CollegeDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industrialVisit: '',
      sem: '',
      ws: '',
      domesticProgram: '',
      international: '',
      authorizedName: '',
      authorizedEmail: '',
      authorizedMobile: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit this form.' });
        return;
    }
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'college_data'), {
        ...values,
        createdByUid: user.uid,
        createdAt: new Date(),
      });
      toast({ title: 'Success', description: 'College data submitted successfully.' });
      form.reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>College Data Entry</CardTitle>
        <CardDescription>Fill out the form to submit college-related program data.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="sem" render={({ field }) => (
                    <FormItem><FormLabel>Semester</FormLabel><FormControl><Input placeholder="e.g., Spring 2024" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="ws" render={({ field }) => (
                    <FormItem><FormLabel>Workshop Details</FormLabel><FormControl><Textarea placeholder="Describe the workshop..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="industrialVisit" render={({ field }) => (
                    <FormItem><FormLabel>Industrial Visit Details</FormLabel><FormControl><Textarea placeholder="Describe the industrial visit..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="domesticProgram" render={({ field }) => (
                    <FormItem><FormLabel>Domestic Immersion Program</FormLabel><FormControl><Textarea placeholder="Describe the domestic program..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="international" render={({ field }) => (
                    <FormItem><FormLabel>International Program</FormLabel><FormControl><Textarea placeholder="Describe the international program..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <CardTitle className='pt-4 text-lg border-t'>Authorized Person</CardTitle>
            <div className='grid md:grid-cols-3 gap-6'>
                <FormField control={form.control} name="authorizedName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="authorizedEmail" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="jane.smith@college.edu" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="authorizedMobile" render={({ field }) => (
                    <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="987-654-3210" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Data
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
