'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoutButton } from '../../components/logout-button';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';
import { Banknote, Briefcase, CalendarDays } from 'lucide-react';

export default function AdminDashboard() {
  const { user, userRole } = useAuthContext();
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
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl">
                            <span className="font-bold text-primary">{greeting},</span> {user?.displayName || 'Admin'}!
                        </CardTitle>
                        <CardDescription>Welcome to your control center.</CardDescription>
                    </div>
                     <Badge variant="outline" className="text-base">Role: {userRole}</Badge>
                </div>
            </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payslip Management</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Review and manage employee salary payments.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Employee Work Progress</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Track task completion and employee productivity.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Overview</CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Monitor daily employee attendance records.</p>
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Log out of your session here.</CardDescription>
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
