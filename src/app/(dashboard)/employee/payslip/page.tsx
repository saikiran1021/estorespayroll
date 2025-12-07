'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, ArrowLeft, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EmployeePayslipPage() {
  // Mock data for display purposes
  const payslip = {
    month: 'July 2024',
    status: 'Paid',
    amount: '₹XX,XXX.XX' // Placeholder amount
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>My Payslip</CardTitle>
              <CardDescription>
                Details of your recent salary payment.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-lg">{payslip.month} Salary</p>
                    <p className="text-muted-foreground">Amount: {payslip.amount}</p>
                </div>
                <Badge className={payslip.status === 'Paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {payslip.status}
                </Badge>
            </div>
             <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg mt-4">
                <p className="text-muted-foreground">
                Payslip download link will appear here.
                </p>
            </div>
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
