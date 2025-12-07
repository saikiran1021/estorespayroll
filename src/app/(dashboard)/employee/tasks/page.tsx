'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Check, Loader2 } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

function TaskCard({ task }: { task: any }) {
    const { toast } = useToast();
    const db = useFirestore();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleMarkAsComplete = async () => {
        setIsLoading(true);
        const taskRef = doc(db, 'employees', task.assignedToEmployeeId, 'tasks', task.id);
        const taskPayload = { status: 'Completed' };
        
        updateDoc(taskRef, taskPayload)
            .then(() => {
                toast({ title: 'Task Updated', description: 'Task marked as completed.' });
            })
            .catch((error) => {
                const contextualError = new FirestorePermissionError({
                    path: taskRef.path,
                    operation: 'update',
                    requestResourceData: taskPayload,
                });
                errorEmitter.emit('permission-error', contextualError);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Task: {task.description}</CardTitle>
                <CardDescription>Due: {task.dueDate ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() : 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div>
                    Status: <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'} className={task.status === 'Completed' ? 'bg-green-500' : ''}>{task.status}</Badge>
                </div>
                {task.status !== 'Completed' && (
                    <Button onClick={handleMarkAsComplete} disabled={isLoading} size="sm">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Mark as Completed
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}


export default function EmployeeTasksPage() {
    const { user } = useUser();
    const db = useFirestore();

    const tasksQuery = useMemoFirebase(() => {
        if (!user || !db) return null;
        return collection(db, 'employees', user.uid, 'tasks');
    }, [user, db]);

    const { data: tasks, isLoading } = useCollection(tasksQuery);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Assigned Work</CardTitle>
              <CardDescription>
                Here are the tasks assigned to you by your admin.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
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
                    You have no tasks assigned. Great job!
                </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/employee/dashboard">
              <ArrowLeft className="mr-2" />
              Exit to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
