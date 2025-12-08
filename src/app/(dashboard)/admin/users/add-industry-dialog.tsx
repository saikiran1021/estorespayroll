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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createNewUser } from './actions';
import { Label } from '@/components/ui/label';

export function AddIndustryDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for all form fields
  const [industryName, setIndustryName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [type, setType] = useState('');
  const [advisorName, setAdvisorName] = useState('');

  const resetForm = () => {
    setIndustryName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setPhotoUrl('');
    setType('');
    setAdvisorName('');
  };

  async function handleSubmit() {
    if (!email || !password || !industryName) {
        toast({
            variant: 'destructive',
            title: 'Missing Required Fields',
            description: 'Industry Name, Login Email, and Password are required.',
        });
        return;
    }
    setIsLoading(true);
    try {
      const result = await createNewUser({
        email,
        password,
        displayName: industryName,
        role: 'Industry',
        phone,
        photoUrl,
        industryData: {
            type: type || '',
            advisorName: advisorName || '',
            contactNum: phone || '',
            email: email,
            photoUrl: photoUrl || '',
            // These fields were not in the form, so setting default/empty values
            dates: new Date().toISOString(),
            department: '',
            numStudents: 0,
        }
      });

       if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Industry Added',
        description: `${industryName} has been successfully created.`,
      });
      resetForm();
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
        <div className="space-y-4">
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto p-1">
               <h4 className="text-md font-semibold pt-2">Industry Credentials (Required)</h4>
                <div><Label htmlFor="industryName">Industry Name *</Label><Input id="industryName" value={industryName} onChange={(e) => setIndustryName(e.target.value)} placeholder="e.g., Tech Corp" /></div>
                <div><Label htmlFor="email">Login Email *</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@techcorp.com" /></div>
                <div><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
              
              <h4 className="text-md font-semibold pt-4 border-t mt-4">Additional Information (Optional)</h4>
                <div><Label htmlFor="phone">Contact Number</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="987-654-3210" /></div>
                <div><Label htmlFor="photoUrl">Profile Photo URL</Label><Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://example.com/logo.png" /></div>
                <div><Label htmlFor="type">Industry Type</Label>
                    <Select onValueChange={setType} value={type}>
                        <SelectTrigger><SelectValue placeholder="Select an industry type..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IT">Information Technology</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="advisorName">Advisor Name</Label><Input id="advisorName" value={advisorName} onChange={(e) => setAdvisorName(e.target.value)} placeholder="e.g., Mr. John Smith" /></div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Industry
                </Button>
            </DialogFooter>
          </div>
      </DialogContent>
    </Dialog>
  );
}
