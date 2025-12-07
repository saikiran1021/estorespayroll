'use client';

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
import { LineChart, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const mockRevenue = [
    { month: 'April 2024', amount: '₹1,20,000.00' },
    { month: 'May 2024', amount: '₹1,50,000.00' },
    { month: 'June 2024', amount: '₹1,35,000.00' },
    { month: 'July 2024', amount: '₹1,75,000.00' },
];

export default function AdminRevenuePage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <LineChart className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>
                An overview of the company's revenue stream.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRevenue.map((rev) => (
                <TableRow key={rev.month}>
                  <TableCell className="font-medium">{rev.month}</TableCell>
                  <TableCell className="text-right">{rev.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
