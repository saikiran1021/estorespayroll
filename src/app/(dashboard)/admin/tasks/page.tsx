'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  CalendarIcon,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  FirestorePermissionError,
  errorEmitter,
} from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  doc,
  deleteDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuthContext } from '@/context/auth-context';

const formSchema = z.object({
  assignedToEmployeeId: z.string().min(1, 'Please select an employee.'),
  description: z.string().min(1, 'Task description is required.'),
  dueDate: z.date(),
});

function AssignTaskForm({
  employees,
  isLoadingEmployees,
}: {
  employees: any[] | null;
  isLoadingEmployees: boolean;
}) {
  const { toast } = useToast();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      assignedToEmployeeId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;
    setIsSubmitting(true);

    const taskRef = collection(
      db,
      'employees',
      values.assignedToEmployeeId,
      'tasks'
    );
    const taskPayload = {
      assignedToEmployeeId: values.assignedToEmployeeId,
      description: values.description,
      dueDate: Timestamp.fromDate(values.dueDate),
      status: 'Pending',
      createdAt: serverTimestamp(),
    };

    addDoc(taskRef, taskPayload)
      .then(() => {
        toast({
          title: 'Task Assigned',
          description: 'The task has been successfully assigned.',
        });
        form.reset();
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          path: `employees/${values.assignedToEmployeeId}/tasks`,
          operation: 'create',
          requestResourceData: taskPayload,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign a New Task</CardTitle>
        <CardDescription>
          Fill out the form below to assign a task to an employee.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="assignedToEmployeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingEmployees}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} {employee.surname} ({employee.email})
                        </SelectItem>
                      ))}
                      {!isLoadingEmployees && employees?.length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground">
                          No employees found.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="E.g., Complete quarterly report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign Task
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AllTasksList() {
  const db = useFirestore();
  const { userRole } = useAuthContext();
  const { toast } = useToast();
  const [allTasks, setAllTasks] = React.useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = React.useState(true);

  const employeesQuery = useMemoFirebase(
    () => {
        if (!db || !userRole || !['Admin', 'Super Admin'].includes(userRole)) return null;
        return query(collection(db, 'employees'));
    },
    [db, userRole]
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
        setIsLoadingTasks(false);
      }, (error) => {
        const contextualError = new FirestorePermissionError({
          path: `employees/${employee.id}/tasks`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
        setIsLoadingTasks(false);
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());

  }, [employees, isLoadingEmployees, db]);


  const handleDeleteTask = async (task: any) => {
    if (!db) return;
    const taskRef = doc(db, 'employees', task.assignedToEmployeeId, 'tasks', task.id);
    try {
        await deleteDoc(taskRef);
        toast({ title: 'Task Deleted', description: 'The task has been removed.'});
    } catch (error) {
        const contextualError = new FirestorePermissionError({
          path: taskRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Progress Overview</CardTitle>
        <CardDescription>
          Monitor the status of all assigned tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(isLoadingTasks || isLoadingEmployees) && (
            <div className="flex items-center gap-2 text-muted-foreground justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading all tasks...</span>
            </div>
        )}
        {!(isLoadingTasks || isLoadingEmployees) && allTasks.length === 0 && (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No tasks have been assigned yet.</p>
            </div>
        )}
        {!(isLoadingTasks || isLoadingEmployees) && allTasks.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTasks.sort((a, b) => (a.createdAt?.seconds > b.createdAt?.seconds ? -1 : 1)).map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.employeeName}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.dueDate ? format(task.dueDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'} className={task.status === 'Completed' ? 'bg-green-500' : ''}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTask(task)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminTasksPage() {
  const db = useFirestore();
  const { userRole } = useAuthContext();

  const employeesQuery = useMemoFirebase(
    () => (db && userRole && ['Admin', 'Super Admin'].includes(userRole) ? query(collection(db, 'employees')) : null),
    [db, userRole]
  );
  const { data: employees, isLoading: isLoadingEmployees } =
    useCollection(employeesQuery);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Assign & Track Work</CardTitle>
              <CardDescription>
                Assign new tasks to employees and monitor their progress.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <AssignTaskForm
          employees={employees}
          isLoadingEmployees={isLoadingEmployees}
        />
        <AllTasksList />
      </div>

       <CardFooter className="flex justify-end mt-4">
          <Button asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit to Dashboard
            </Link>
          </Button>
        </CardFooter>
    </div>
  );
}
