// This file path is new
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

function EmployeeTasksList() {
  const db = useFirestore();
  const [allTasks, setAllTasks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const employeesQuery = useMemoFirebase(
    () => (db ? query(collection(db, 'employees')) : null),
    [db]
  );
  const { data: employees, isLoading: isLoadingEmployees } = useCollection(employeesQuery);

  React.useEffect(() => {
    if (!employees || isLoadingEmployees || !db) return;

    const unsubscribes = employees.map((employee) => {
      const tasksQuery = query(collection(db, 'employees', employee.id, 'tasks'));
      return onSnapshot(tasksQuery, (snapshot) => {
        const employeeTasks = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            employeeName: `${employee.name} ${employee.surname}`
        }));

        setAllTasks(prevTasks => {
            const otherTasks = prevTasks.filter(task => task.assignedToEmployeeId !== employee.id);
            return [...otherTasks, ...employeeTasks];
        });
        setIsLoading(false);
      }, (error) => {
        const contextualError = new FirestorePermissionError({
          path: `employees/${employee.id}/tasks`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
        setIsLoading(false);
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());

  }, [employees, isLoadingEmployees, db]);


  return (
    <>
      {(isLoading || isLoadingEmployees) ? (
        <div className="flex items-center gap-2 text-muted-foreground justify-center p-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading employee tasks...</span>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTasks.length > 0 ? (
              allTasks.sort((a, b) => (a.createdAt?.seconds > b.createdAt?.seconds ? -1 : 1)).map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.employeeName}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.dueDate ? format(task.dueDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'} className={task.status === 'Completed' ? 'bg-green-500' : ''}>
                      {task.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No tasks assigned to employees yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
}

export default function SuperAdminTasksPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Work Progress Overview</CardTitle>
              <CardDescription>
                Monitor task status for all employees and admins.
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
                    <EmployeeTasksList />
                </TabsContent>
                <TabsContent value="admins">
                     <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Admin task monitoring is not yet implemented.</p>
                    </div>
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
