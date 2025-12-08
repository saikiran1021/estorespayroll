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
import { Label } from '@/components/ui/label';

export function AddIndustryDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    industryName: '',
    email: '',
    phone: '',
    password: '',
    photoUrl: '',
    type: '',
    advisorName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({...prev, type: value}));
  }

  const resetForm = () => {
    setFormData({
      industryName: '',
      email: '',
      phone: '',
      password: '',
      photoUrl: '',
      type: '',
      advisorName: '',
    });
  };

  async function handleSubmit() {
    if (!formData.email || !formData.password || !formData.industryName) {
        toast({
            variant: 'destructive',
            title: 'Missing Required Fields',
            description: 'Industry Name, Login Email, and Password are required.',
        });
        return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      toast({
        title: 'Industry Added',
        description: `${formData.industryName} has been successfully created.`,
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
                <div><Label htmlFor="industryName">Industry Name *</Label><Input id="industryName" value={formData.industryName} onChange={handleInputChange} placeholder="e.g., Tech Corp" /></div>
                <div><Label htmlFor="email">Login Email *</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="contact@techcorp.com" /></div>
                <div><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" /></div>
              
              <h4 className="text-md font-semibold pt-4 border-t mt-4">Additional Information (Optional)</h4>
                <div><Label htmlFor="phone">Contact Number</Label><Input id="phone" value={formData.phone} onChange={handleInputChange} placeholder="987-654-3210" /></div>
                <div><Label htmlFor="photoUrl">Profile Photo URL</Label><Input id="photoUrl" value={formData.photoUrl} onChange={handleInputChange} placeholder="https://example.com/logo.png" /></div>
                <div><Label htmlFor="type">Industry Type</Label>
                    <Select onValueChange={handleSelectChange} value={formData.type}>
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
                <div><Label htmlFor="advisorName">Advisor Name</Label><Input id="advisorName" value={formData.advisorName} onChange={handleInputChange} placeholder="e.g., Mr. John Smith" /></div>
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
