'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

function UserTable({ userType }: { userType: 'employees' | 'admins' }) {
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, userType), orderBy('lastLogin', 'desc'));
  }, [db, userType]);

  const { data: users, isLoading } = useCollection(usersQuery);

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
              <TableHead>Last Login</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Work Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name} {user.surname}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.lastLogin ? format(parseISO(user.lastLogin), "PPP 'at' p") : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/super-admin/users/${user.id}/attendance`}>View</Link>
                    </Button>
                  </TableCell>
                  <TableCell>
                     <Button asChild variant="outline" size="sm">
                        <Link href={`/super-admin/users/${user.id}/tasks`}>View</Link>
                     </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
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

export default function SuperAdminManageUsersPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>
                Oversee all employees and administrators in the system.
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
              <Card>
                <CardHeader>
                  <CardTitle>Employee Details</CardTitle>
                  <CardDescription>Monitor login activity, attendance, and work progress for all employees.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable userType="employees" />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="admins">
              <Card>
                 <CardHeader>
                  <CardTitle>Administrator Details</CardTitle>
                  <CardDescription>Monitor login activity and performance for all administrators.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable userType="admins" />
                </CardContent>
              </Card>
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
