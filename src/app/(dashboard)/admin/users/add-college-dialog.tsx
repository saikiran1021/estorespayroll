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

export function AddCollegeDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
      collegeName: '',
      photoUrl: '',
      authorizedName: '',
      authorizedMobile: '',
      email: '',
      password: '',
      industrialVisit: '',
      sem: '',
      tt: '',
      ws: '',
      international: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };


  const resetForm = () => {
    setFormData({
      collegeName: '',
      photoUrl: '',
      authorizedName: '',
      authorizedMobile: '',
      email: '',
      password: '',
      industrialVisit: '',
      sem: '',
      tt: '',
      ws: '',
      international: '',
    });
  };

  async function handleSubmit() {
    if (!formData.email || !formData.password || !formData.collegeName) {
        toast({
            variant: 'destructive',
            title: 'Missing Required Fields',
            description: 'College Name, Login Email, and Password are required.',
        });
        return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/college', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      toast({
        title: 'College Added',
        description: `${formData.collegeName} has been successfully created.`,
      });
      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error creating college:", error);
      toast({
        variant: 'destructive',
        title: 'Error Creating College',
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
                <div><Label htmlFor="collegeName">College Name *</Label><Input id="collegeName" value={formData.collegeName} onChange={handleInputChange} placeholder="e.g., State University" /></div>
                <div><Label htmlFor="photoUrl">Photo URL</Label><Input id="photoUrl" value={formData.photoUrl} onChange={handleInputChange} placeholder="https://example.com/logo.png" /></div>

              <h4 className="text-md font-semibold pt-2">Authorized Person</h4>
                <div><Label htmlFor="authorizedName">Full Name</Label><Input id="authorizedName" value={formData.authorizedName} onChange={handleInputChange} placeholder="e.g., Dr. Jane Doe" /></div>
                <div><Label htmlFor="authorizedMobile">Mobile Number</Label><Input id="authorizedMobile" value={formData.authorizedMobile} onChange={handleInputChange} placeholder="123-456-7890" /></div>

              <h4 className="text-md font-semibold pt-2">Login Credentials</h4>
                <div><Label htmlFor="email">Login Email *</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="contact@stateuni.edu" /></div>
                <div><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" /></div>

              <h4 className="text-md font-semibold pt-4 border-t mt-4">Additional Information (Optional)</h4>
                <div><Label htmlFor="industrialVisit">Industrial Visit</Label><Textarea id="industrialVisit" value={formData.industrialVisit} onChange={handleInputChange} placeholder="Details about industrial visits..." /></div>
                <div><Label htmlFor="sem">SEM</Label><Textarea id="sem" value={formData.sem} onChange={handleInputChange} placeholder="Details about SEM..." /></div>
                <div><Label htmlFor="tt">TT</Label><Textarea id="tt" value={formData.tt} onChange={handleInputChange} placeholder="Details about TT..." /></div>
                <div><Label htmlFor="ws">W/S (Workshop)</Label><Textarea id="ws" value={formData.ws} onChange={handleInputChange} placeholder="Details about workshops..." /></div>
                <div><Label htmlFor="international">International Programs</Label><Textarea id="international" value={formData.international} onChange={handleInputChange} placeholder="Details about international programs..." /></div>
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
