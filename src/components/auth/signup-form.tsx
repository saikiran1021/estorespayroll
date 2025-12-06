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
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, onAuthStateChanged, type User, type AuthError } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useAuth, useFirestore, setDocumentNonBlocking, initiateEmailSignUp } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['Employee', 'Admin', 'Super Admin', 'College', 'Industry']),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

function generateEmployeeId(name: string, surname: string) {
    const initials = (name.charAt(0) + surname.charAt(0)).toUpperCase();
    const datePart = format(new Date(), 'yyyyMM');
    return `ESG${datePart}${initials}`;
}

export function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const db = useFirestore();


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
  
  const values = form.watch();
  const selectedRole = values.role;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
        if (user && isSubmitting) {
            try {
                await updateProfile(user, {
                    displayName: `${values.name} ${values.surname}`
                });
                
                const role = values.role;
                const collections: { [key: string]: string } = {
                    Employee: 'employees',
                    Admin: 'admins',
                    'Super Admin': 'super_admins',
                    College: 'colleges',
                    Industry: 'industries',
                };
                const roleCollections: { [key: string]: string } = {
                    Employee: 'roles_employee',
                    Admin: 'roles_admin',
                    'Super Admin': 'roles_super_admin',
                    College: 'roles_college',
                    Industry: 'roles_industry',
                }

                const collectionName = collections[role];
                const roleCollectionName = roleCollections[role];
                
                if (!collectionName || !roleCollectionName) {
                    throw new Error('Invalid role selected');
                }

                const userDocRef = doc(db, collectionName, user.uid);
                let userData: any = {
                    id: user.uid,
                    name: values.name,
                    surname: values.surname,
                    phone: values.phone,
                    email: values.email,
                    lastLogin: new Date().toISOString(),
                };
                
                if (role === 'Employee') {
                    userData.employeeId = generateEmployeeId(values.name, values.surname);
                } else if (role === 'College' || role === 'Industry') {
                    // For College and Industry, use 'name' as the main identifier, not name/surname
                    userData = {
                        id: user.uid,
                        name: values.name, // The form's "name" field will be the college/industry name
                        phone: values.phone,
                        email: values.email,
                        lastLogin: new Date().toISOString(),
                    };
                }


                setDocumentNonBlocking(userDocRef, userData, { merge: true });

                const roleMapDocRef = doc(db, roleCollectionName, user.uid);
                setDocumentNonBlocking(roleMapDocRef, { uid: user.uid }, { merge: true });
                
                toast({
                    title: 'Signup Successful',
                    description: "You've been successfully registered. Redirecting...",
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
                setIsSubmitting(false);
            }
        }
    });

    return () => unsubscribe();
  }, [isSubmitting, values, router, toast, auth, db]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsSubmitting(true);
    
    initiateEmailSignUp(auth, values.email, values.password, (error: AuthError) => {
        setIsLoading(false);
        setIsSubmitting(false);
        if (error.code === 'auth/email-already-in-use') {
            toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description: 'This email address is already registered. Please sign in.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {selectedRole === 'Employee' || selectedRole === 'Admin' || selectedRole === 'Super Admin' ? (
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="surname" render={({ field }) => (
                    <FormItem><FormLabel>Surname</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
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
         <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
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
        <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : `Sign Up as ${selectedRole}`}
        </Button>
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-primary">
            Sign in here
          </Link>
        </div>
      </form>
    </Form>
  );
}
