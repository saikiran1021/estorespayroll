'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { createNewUser } from '@/app/(dashboard)/admin/users/actions';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surname: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['Employee', 'Admin', 'Super Admin', 'College', 'Industry']),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine(data => {
    if ((data.role === 'Employee' || data.role === 'Admin' || data.role === 'Super Admin') && !data.surname) {
        return false;
    }
    return true;
}, {
    message: "Surname is required for this role",
    path: ['surname'],
});


export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      surname: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Employee',
    },
  });
  
  const selectedRole = form.watch('role');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        const result = await createNewUser({
            email: values.email,
            password: values.password,
            displayName: values.name,
            role: values.role,
            phone: values.phone,
            surname: values.surname,
        });

        if (result.error) {
            throw new Error(result.error);
        }

        toast({
            title: 'Signup Successful',
            description: "You've been registered. Please log in.",
        });
        
        router.push('/login');

    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Signup Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>I am a...</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Industry">Industry</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedRole === 'Employee' || selectedRole === 'Admin' || selectedRole === 'Super Admin' ? (
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="surname" render={({ field }) => (
                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        ) : (
             <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>{selectedRole} Name</FormLabel><FormControl><Input placeholder={`e.g., ${selectedRole === 'College' ? 'State University' : 'Tech Corp'}`} {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        )}

        <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="123-456-7890" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john.doe@estores.com" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : `Sign Up`}
        </Button>
      </form>
    </Form>
  );
}
