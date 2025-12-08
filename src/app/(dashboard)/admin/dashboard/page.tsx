'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogoutButton } from '../../components/logout-button';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';
import { Banknote, Briefcase, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const mockEmployees = [
    { id: 'emp-001', name: 'John Doe', status: 'Paid', salary: '₹50,000.00' },
    { id: 'emp-002', name: 'Jane Smith', status: 'Paid', salary: '₹55,000.00' },
    { id: 'emp-003', name: 'Peter Jones', status: 'Pending', salary: '₹48,000.00' },
    { id: 'emp-004', name: 'Mary Williams', status: 'Paid', salary: '₹62,000.00' },
];

export default function AdminDashboard() {
  const { user, userRole } = useAuthContext();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                <span className="font-bold text-primary">{greeting},</span>{' '}
                {user?.displayName || 'Admin'}!
              </CardTitle>
              <CardDescription>Welcome to your control center.</CardDescription>
            </div>
            <Badge variant="outline" className="text-base">
              Role: {userRole}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border rounded-lg bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex flex-row items-center justify-between space-y-0 w-full">
                    <div className='text-left'>
                        <CardTitle className="text-sm font-medium">
                        Payslip Management
                        </CardTitle>
                        <CardDescription className="text-xs">
                        Review and manage employee salary payments.
                        </CardDescription>
                    </div>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Employee Name</TableHead>
                                <TableHead>Salary Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{employee.id}</TableCell>
                                    <TableCell>{employee.name}</TableCell>
                                    <TableCell>{employee.salary}</TableCell>
                                    <TableCell>
                                        <Badge className={employee.status === 'Paid' ? 'bg-green-500 text-white hover:bg-green-500/90' : 'bg-yellow-500 text-white hover:bg-yellow-500/90'}>
                                            {employee.status === 'Paid' ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                                            {employee.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">View Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="border rounded-lg bg-card">
           <AccordionTrigger className="p-6 hover:no-underline">
                 <div className="flex flex-row items-center justify-between space-y-0 w-full">
                    <div className='text-left'>
                        <CardTitle className="text-sm font-medium">
                        Employee Work Progress
                        </CardTitle>
                        <CardDescription className="text-xs">
                        Track task completion and employee productivity.
                        </CardDescription>
                    </div>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
           </AccordionTrigger>
           <AccordionContent>
                <CardContent>
                    <p className="text-muted-foreground text-center">Work progress details will be shown here.</p>
                </CardContent>
           </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" className="border rounded-lg bg-card">
           <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex flex-row items-center justify-between space-y-0 w-full">
                    <div className='text-left'>
                        <CardTitle className="text-sm font-medium">
                        Attendance Overview
                        </CardTitle>
                        <CardDescription className="text-xs">
                        Monitor daily employee attendance records.
                        </CardDescription>
                    </div>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
           </AccordionTrigger>
            <AccordionContent>
                <CardContent>
                    <p className="text-muted-foreground text-center">Attendance overview details will be shown here.</p>
                </CardContent>
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Log out of your session here.</CardDescription>
        </CardHeader>
        <CardContent>
          <LogoutButton className="w-auto" variant="destructive">
            Exit Dashboard
          </LogoutButton>
        </CardContent>
      </Card>
    </div>
  );
}
