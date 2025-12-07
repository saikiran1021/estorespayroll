'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockEmployees = [
    { id: 'emp-001', name: 'John Doe', status: 'Paid' },
    { id: 'emp-002', name: 'Jane Smith', status: 'Paid' },
    { id: 'emp-003', name: 'Peter Jones', status: 'Pending' },
    { id: 'emp-004', name: 'Mary Williams', status: 'Paid' },
];

export default function AdminPayslipPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Payslip Management</CardTitle>
              <CardDescription>
                Review and manage salary payments for all employees for July 2024.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.id}</TableCell>
                            <TableCell>{employee.name}</TableCell>
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
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2" />
              Exit to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
