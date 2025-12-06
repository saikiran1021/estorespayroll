import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const demoCredentials = [
    { role: 'Employee', email: 'employee@estores.com', password: 'password123' },
    { role: 'Admin', email: 'admin@estores.com', password: 'admin123' },
    { role: 'Super Admin', email: 'superadmin@estores.com', password: 'super123' },
    { role: 'College', email: 'college@estores.com', password: 'college123' },
    { role: 'Industry', email: 'industry@estores.com', password: 'industry123' },
]

export default function LoginPage() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">
            eStores WorkHub
          </CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Demo Credentials</CardTitle>
            <CardDescription>Use these credentials to explore the different roles.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Password</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {demoCredentials.map((cred) => (
                        <TableRow key={cred.role}>
                            <TableCell className="font-medium">{cred.role}</TableCell>
                            <TableCell>{cred.email}</TableCell>
                            <TableCell>{cred.password}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
