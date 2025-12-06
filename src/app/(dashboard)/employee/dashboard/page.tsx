'use client';

import { useAuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';


function AttendanceWidget() {
    const { toast } = useToast();
    const { user } = useUser();
    const db = useFirestore();
    const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Not Marked' | null>(null);
    const [loading, setLoading] = useState(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user) return;
            try {
                const attendanceCol = collection(db, 'attendance');
                const q = query(
                    attendanceCol, 
                    where('employeeUid', '==', user.uid),
                    where('date', '>=', Timestamp.fromDate(today))
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const attendanceData = querySnapshot.docs[0].data();
                    setAttendanceStatus(attendanceData.status);
                } else {
                    setAttendanceStatus('Not Marked');
                }
            } catch (error) {
                console.error("Error fetching attendance: ", error);
                setAttendanceStatus(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [user, today, db]);


    const markAttendance = async (status: 'Present' | 'Absent') => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }

        try {
            const attendanceRef = doc(db, 'attendance', `${user.uid}_${today.toISOString().split('T')[0]}`);
            await setDoc(attendanceRef, {
                employeeUid: user.uid,
                date: Timestamp.fromDate(today),
                status: status,
            });
            setAttendanceStatus(status);
            toast({ title: 'Success', description: `Attendance marked as ${status}.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    return (
        <Card className="fixed bottom-4 right-4 z-50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-base">Today&apos;s Attendance</CardTitle>
                <CardDescription>Mark your attendance for today.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>Loading status...</p>
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
