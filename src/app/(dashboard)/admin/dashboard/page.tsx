'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoutButton } from '../../components/logout-button';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/context/auth-context';

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">
                    <span className="font-bold text-primary">Welcome,</span> {greeting} {user?.displayName || 'Admin'}!
                </CardTitle>
                <CardDescription>This is your control center. Manage employees, track revenue, and more.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Revenue chart will be displayed here.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Attendance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Attendance table will be displayed here.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Assign Work</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Task assignment form will be here.</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Log out of your account here.</CardDescription>
            </CardHeader>
            <CardContent>
                <LogoutButton className="w-auto" variant="destructive">
                    Exit Dashboard
                </LogoutButton>
            </CardContent>
        </Card>
    </div>
  );
}
