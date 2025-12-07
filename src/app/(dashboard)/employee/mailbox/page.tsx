'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function EmployeeMailboxPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Mail className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>My Mailbox</CardTitle>
              <CardDescription>
                Your messages will be displayed here in the future.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              The mailbox feature is under construction.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/employee/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
