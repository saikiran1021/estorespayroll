'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';

function TaskCard({ task }: { task: any }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Task: {task.description}</CardTitle>
                <CardDescription>Due: {task.dueDate ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() : 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent>
                Status: <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'} className={task.status === 'Completed' ? 'bg-green-500' : ''}>{task.status}</Badge>
            </CardContent>
        </Card>
    );
}

export default function SuperAdminUserTasksPage() {
    const params = useParams();
    const userId = params.userId as string;
    const db = useFirestore();

    const tasksQuery = useMemoFirebase(() => {
        if (!userId || !db) return null;
        // The tasks are in a subcollection under the specific employee
        return query(collection(db, 'employees', userId, 'tasks'));
    }, [userId, db]);

    const { data: tasks, isLoading } = useCollection(tasksQuery);

    // TODO: We should probably fetch the user's name to display in the title
    const employeeName = "Employee"; 

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Briefcase className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle>Work Progress for {employeeName}</CardTitle>
                            <CardDescription>
                                Here are all the tasks assigned to this user.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground justify-center p-8">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading tasks...</span>
                        </div>
                    )}
                    {!isLoading && tasks && tasks.length > 0 && (
                        tasks.map(task => <TaskCard key={task.id} task={task} />)
                    )}
                    {!isLoading && (!tasks || tasks.length === 0) && (
                        <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">
                                This user has no tasks assigned.
                            </p>
                        </div>
                    )}
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
