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

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Payslip Management
                </CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Review and manage employee salary payments.
                </p>
              </CardContent>
            </Card>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
                <CardHeader>
                    <CardTitle>July 2024 Payslips</CardTitle>
                    <CardDescription>Review and manage salary payments for all employees.</CardDescription>
                </CardHeader>
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
                                        <Badge className={employee.status === 'Paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
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
            </Card>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
           <AccordionTrigger>
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Employee Work Progress
                    </CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">
                    Track task completion and employee productivity.
                    </p>
                </CardContent>
                </Card>
           </AccordionTrigger>
           <AccordionContent>
                <Card>
                    <CardContent className='pt-6'>
                        <p className="text-muted-foreground text-center">Work progress details will be shown here.</p>
                    </CardContent>
                </Card>
           </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
           <AccordionTrigger>
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Attendance Overview
                        </CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                        Monitor daily employee attendance records.
                        </p>
                    </CardContent>
                </Card>
           </AccordionTrigger>
            <AccordionContent>
                <Card>
                    <CardContent className='pt-6'>
                        <p className="text-muted-foreground text-center">Attendance overview details will be shown here.</p>
                    </CardContent>
                </Card>
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
