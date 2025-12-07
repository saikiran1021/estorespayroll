'use client';

import { useAuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { doc, setDoc, collection, query, where, Timestamp } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '../../components/logout-button';


function AttendanceWidget() {
    const { toast } = useToast();
    const { user } = useUser();
    const db = useFirestore();
    const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Not Marked' | null>(null);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const attendanceQuery = useMemoFirebase(() => {
        if (!user || !db) return null;
        return query(
            collection(db, 'attendance'),
            where('employeeUid', '==', user.uid),
            where('date', '>=', Timestamp.fromDate(today))
        );
    }, [user, db, today]);

    const { data: attendanceData, isLoading: attendanceLoading } = useCollection(attendanceQuery);
    
    useEffect(() => {
        if (attendanceLoading) {
            setAttendanceStatus(null);
            return;
        }
        if (attendanceData && attendanceData.length > 0) {
            setAttendanceStatus(attendanceData[0].status);
        } else {
            setAttendanceStatus('Not Marked');
        }
    }, [attendanceData, attendanceLoading]);


    const markAttendance = async (status: 'Present' | 'Absent') => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }

        const attendanceRef = doc(db, 'attendance', `${user.uid}_${today.toISOString().split('T')[0]}`);
        const attendancePayload = {
            employeeUid: user.uid,
            date: Timestamp.fromDate(today),
            status: status,
        };

        setDoc(attendanceRef, attendancePayload)
          .then(() => {
            toast({ title: 'Success', description: `Attendance marked as ${status}.` });
          })
          .catch((error: any) => {
            const contextualError = new FirestorePermissionError({
                path: attendanceRef.path,
                operation: 'write',
                requestResourceData: attendancePayload
            });
            errorEmitter.emit('permission-error', contextualError);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not mark attendance due to permissions.' });
        });
    };

    return (
        <Card className="fixed bottom-4 right-4 z-50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-base">Today&apos;s Attendance</CardTitle>
                <CardDescription>Mark your attendance for today.</CardDescription>
            </CardHeader>
            <CardContent>
                {attendanceLoading || attendanceStatus === null ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading status...</span>
                    </div>
                ) : attendanceStatus === 'Not Marked' ? (
                    <div className="flex gap-2">
                        <Button onClick={() => markAttendance('Present')} className="w-full bg-green-500 hover:bg-green-600 text-white">
                            <Check className="mr-2" /> Present
                        </Button>
                        <Button onClick={() => markAttendance('Absent')} variant="destructive" className="w-full">
                            <X className="mr-2" /> Absent
                        </Button>
                    </div>
                ) : (
                    <p>
                        Your attendance is marked as: <Badge className={attendanceStatus === 'Present' ? 'bg-green-500' : 'bg-red-500'}>{attendanceStatus}</Badge>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}


export default function EmployeeDashboard() {
  const { user, employeeId } = useAuthContext();
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
                <CardTitle>Welcome, {user?.displayName || user?.email}!</CardTitle>
                <CardDescription>This is your personal dashboard.</CardDescription>
            </div>
            <LogoutButton variant="outline" className="w-auto">Logout</LogoutButton>
          </div>
        </CardHeader>
        <CardContent>
            {employeeId && (
                <p><strong>Employee ID:</strong> {employeeId}</p>
            )}
            <p><strong>Role:</strong> Employee</p>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>Assigned Work</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">No tasks assigned yet.</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Important Documents</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">No documents uploaded yet.</p></CardContent>
        </Card>
      </div>

      <AttendanceWidget />
    </div>
  );
}
