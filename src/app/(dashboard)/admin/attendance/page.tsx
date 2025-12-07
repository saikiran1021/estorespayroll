'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp, getDocs } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface EmployeeWithAttendance extends Document {
  id: string;
  name: string;
  surname: string;
  email: string;
  attendanceStatus: 'Present' | 'Absent' | 'Not Marked';
}

export default function AdminAttendancePage() {
  const db = useFirestore();
  const [employeesWithAttendance, setEmployeesWithAttendance] = useState<EmployeeWithAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const employeesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'employees'));
  }, [db]);

  const { data: employees, isLoading: isLoadingEmployees } = useCollection(employeesQuery);

  useEffect(() => {
    if (isLoadingEmployees || !employees || !db) return;

    const fetchAttendanceForAll = async () => {
      setIsLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfToday = Timestamp.fromDate(today);

      const attendancePromises = employees.map(async (employee) => {
        const attendanceQuery = query(
          collection(db, 'employees', employee.id, 'attendance'),
          where('date', '>=', startOfToday)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        let status: EmployeeWithAttendance['attendanceStatus'] = 'Not Marked';
        if (!attendanceSnapshot.empty) {
          status = attendanceSnapshot.docs[0].data().status;
        }
        return { ...employee, attendanceStatus: status } as EmployeeWithAttendance;
      });

      const results = await Promise.all(attendancePromises);
      setEmployeesWithAttendance(results);
      setIsLoading(false);
    };

    fetchAttendanceForAll();
  }, [employees, isLoadingEmployees, db]);

  const getStatusBadge = (status: EmployeeWithAttendance['attendanceStatus']) => {
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
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Daily Attendance Overview</CardTitle>
              <CardDescription>
                View the attendance status for all employees for today.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Today's Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeesWithAttendance.length > 0 ? (
                  employeesWithAttendance.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name} {employee.surname}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        {getStatusBadge(employee.attendanceStatus)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
