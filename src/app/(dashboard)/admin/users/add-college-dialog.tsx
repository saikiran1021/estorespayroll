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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createNewUser } from './actions';

export function AddCollegeDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for all form fields
  const [collegeName, setCollegeName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [authorizedName, setAuthorizedName] = useState('');
  const [authorizedMobile, setAuthorizedMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [industrialVisit, setIndustrialVisit] = useState('');
  const [sem, setSem] = useState('');
  const [tt, setTt] = useState('');
  const [ws, setWs] = useState('');
  const [international, setInternational] = useState('');

  const resetForm = () => {
    setCollegeName('');
    setPhotoUrl('');
    setAuthorizedName('');
    setAuthorizedMobile('');
    setEmail('');
    setPassword('');
    setIndustrialVisit('');
    setSem('');
    setTt('');
    setWs('');
    setInternational('');
  };

  async function handleSubmit() {
    if (!email || !password || !collegeName) {
        toast({
            variant: 'destructive',
            title: 'Missing Required Fields',
            description: 'College Name, Login Email, and Password are required.',
        });
        return;
    }

    setIsLoading(true);
    try {
      const result = await createNewUser({
        email,
        password,
        displayName: collegeName,
        role: 'College',
        phone: authorizedMobile,
        photoUrl,
        collegeData: {
          authorizedName,
          authorizedEmail: email,
          authorizedMobile,
          industrialVisit,
          sem,
          ws,
          tt,
          international,
          photoUrl,
        }
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'College Added',
        description: `${collegeName} has been successfully created.`,
      });
      resetForm();
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
            Fill out the details below. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto p-1">
               <h4 className="text-md font-semibold pt-2">College Details</h4>
                <div><Label htmlFor="collegeName">College Name *</Label><Input id="collegeName" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="e.g., State University" /></div>
                <div><Label htmlFor="photoUrl">Photo URL</Label><Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://example.com/logo.png" /></div>

              <h4 className="text-md font-semibold pt-2">Authorized Person</h4>
                <div><Label htmlFor="authorizedName">Full Name</Label><Input id="authorizedName" value={authorizedName} onChange={(e) => setAuthorizedName(e.target.value)} placeholder="e.g., Dr. Jane Doe" /></div>
                <div><Label htmlFor="authorizedMobile">Mobile Number</Label><Input id="authorizedMobile" value={authorizedMobile} onChange={(e) => setAuthorizedMobile(e.target.value)} placeholder="123-456-7890" /></div>

              <h4 className="text-md font-semibold pt-2">Login Credentials</h4>
                <div><Label htmlFor="email">Login Email *</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@stateuni.edu" /></div>
                <div><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>

              <h4 className="text-md font-semibold pt-4 border-t mt-4">Additional Information (Optional)</h4>
                <div><Label htmlFor="industrialVisit">Industrial Visit</Label><Textarea id="industrialVisit" value={industrialVisit} onChange={(e) => setIndustrialVisit(e.target.value)} placeholder="Details about industrial visits..." /></div>
                <div><Label htmlFor="sem">SEM</Label><Textarea id="sem" value={sem} onChange={(e) => setSem(e.target.value)} placeholder="Details about SEM..." /></div>
                <div><Label htmlFor="tt">TT</Label><Textarea id="tt" value={tt} onChange={(e) => setTt(e.target.value)} placeholder="Details about TT..." /></div>
                <div><Label htmlFor="ws">W/S (Workshop)</Label><Textarea id="ws" value={ws} onChange={(e) => setWs(e.target.value)} placeholder="Details about workshops..." /></div>
                <div><Label htmlFor="international">International Programs</Label><Textarea id="international" value={international} onChange={(e) => setInternational(e.target.value)} placeholder="Details about international programs..." /></div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save College
                </Button>
            </DialogFooter>
          </div>
      </DialogContent>
    </Dialog>
  );
}