'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  industryType: z.string().min(1, 'Industry type is required.'),
  dates: z.date({ required_error: 'A date is required.' }),
  department: z.string().min(1, 'Department is required.'),
  numStudents: z.coerce.number().int().positive('Must be a positive number.'),
  advisorName: z.string().min(1, 'Advisor name is required.'),
  contactNum: z.string().min(10, 'Must be at least 10 digits.'),
  email: z.string().email('Invalid email address.'),
});

export default function IndustryDashboard() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industryType: '',
      department: '',
      advisorName: '',
      contactNum: '',
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'industry_data'), {
        ...values,
        createdByUid: user.uid,
        createdAt: new Date(),
      });
      toast({ title: 'Success', description: 'Industry data submitted successfully.' });
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
            <CardTitle>Industry Data Entry</CardTitle>
            <CardDescription>Fill out the form to submit industry collaboration details.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField control={form.control} name="industryType" render={({ field }) => (
                        <FormItem><FormLabel>Industry Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="IT">Information Technology</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="department" render={({ field }) => (
                        <FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="e.g., Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="dates" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Date of Visit/Event</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus /></PopoverContent>
                            </Popover><FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="numStudents" render={({ field }) => (
                        <FormItem><FormLabel>Number of Students</FormLabel><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="advisorName" render={({ field }) => (
                        <FormItem><FormLabel>Advisor Name</FormLabel><FormControl><Input placeholder="Dr. Alan Turing" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="contactNum" render={({ field }) => (
                        <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input placeholder="111-222-3333" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="advisor@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <Button type="submit" disabled={isLoading} className="mt-6">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Industry Data
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
