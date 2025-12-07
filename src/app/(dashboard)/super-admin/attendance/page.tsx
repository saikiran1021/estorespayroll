'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp, getDocs, DocumentData } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type UserWithAttendance = DocumentData & {
  id: string;
  name: string;
  surname?: string;
  email: string;
  attendanceStatus: 'Present' | 'Absent' | 'Not Marked';
};

function AttendanceTable({ userType }: { userType: 'employees' | 'admins' }) {
  const db = useFirestore();
  const [usersWithAttendance, setUsersWithAttendance] = useState<UserWithAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, userType));
  }, [db, userType]);

  const { data: users, isLoading: isLoadingUsers } = useCollection(usersQuery);

  useEffect(() => {
    if (isLoadingUsers || !users || !db) return;

    const fetchAttendanceForAll = async () => {
      setIsLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfToday = Timestamp.fromDate(today);

      const attendancePromises = users.map(async (user) => {
        const attendanceQuery = query(
          collection(db, userType, user.id, 'attendance'),
          where('date', '>=', startOfToday)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        let status: UserWithAttendance['attendanceStatus'] = 'Not Marked';
        if (!attendanceSnapshot.empty) {
          status = attendanceSnapshot.docs[0].data().status;
        }
        return { ...user, attendanceStatus: status } as UserWithAttendance;
      });

      const results = await Promise.all(attendancePromises);
      setUsersWithAttendance(results);
      setIsLoading(false);
    };

    fetchAttendanceForAll();
  }, [users, isLoadingUsers, db, userType]);
  
  const getStatusBadge = (status: UserWithAttendance['attendanceStatus']) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-500 text-white hover:bg-green-600">Present</Badge>;
      case 'Absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'Not Marked':
        return <Badge variant="secondary">Not Marked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Today's Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithAttendance.length > 0 ? (
              usersWithAttendance.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name} {user.surname || ''}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {getStatusBadge(user.attendanceStatus)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No {userType} found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
}


export default function SuperAdminAttendancePage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>System-wide Attendance Logs</CardTitle>
              <CardDescription>
                View the daily attendance status for all employees and admins.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="employees">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                </TabsList>
                <TabsContent value="employees">
                    <AttendanceTable userType="employees" />
                </TabsContent>
                <TabsContent value="admins">
                    <AttendanceTable userType="admins" />
                </TabsContent>
            </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/super-admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
