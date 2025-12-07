'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Users, Building, GraduationCap } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function UserTable({ userType }: { userType: 'colleges' | 'industries' }) {
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, userType));
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
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
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

export default function AdminManageUsersPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>
                View and manage College and Industry users.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colleges">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="colleges">
                <GraduationCap className="mr-2 h-4 w-4" />
                Colleges
              </TabsTrigger>
              <TabsTrigger value="industries">
                <Building className="mr-2 h-4 w-4" />
                Industries
              </TabsTrigger>
            </TabsList>
            <TabsContent value="colleges">
              <Card>
                <CardHeader>
                  <CardTitle>College Users</CardTitle>
                  <CardDescription>List of all registered college partners.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable userType="colleges" />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="industries">
              <Card>
                 <CardHeader>
                  <CardTitle>Industry Users</CardTitle>
                  <CardDescription>List of all registered industry partners.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable userType="industries" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
