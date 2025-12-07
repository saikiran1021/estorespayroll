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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";


const demoCredentials = [
    { role: 'Employee', email: 'employee@estores.com', password: 'password123' },
    { role: 'Admin', email: 'admin@estores.com', password: 'admin123' },
    { role: 'Super Admin', email: 'superadmin@estores.com', password: 'super123' },
]

export default function LoginPage() {
  const logo = PlaceHolderImages.find((img) => img.id === "estores-logo");

  return (
    <>
      <div className="hidden items-center justify-center bg-gray-100/50 p-10 dark:bg-zinc-900/50 lg:flex" style={{ background: 'linear-gradient(to bottom, hsl(var(--background)), #FAFAFA)' }}>
        <div className="flex flex-col items-center text-center">
            {logo && (
            <Image
                src={logo.imageUrl}
                alt={logo.description}
                width={300}
                height={80}
                data-ai-hint={logo.imageHint}
                className="object-contain"
            />
            )}
            <h1 className="mt-6 text-3xl font-bold text-primary">
                eStores WorkHub
            </h1>
            <p className="mt-2 text-muted-foreground">
                Your integrated portal for workforce management.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden flex justify-center">
                {logo && (
                    <Image
                        src={logo.imageUrl}
                        alt={logo.description}
                        width={200}
                        height={50}
                        data-ai-hint={logo.imageHint}
                        className="object-contain"
                    />
                )}
            </div>
            <Card>
                <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight text-primary">
                    Welcome Back
                </CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
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
      </div>
    </>
  );
}
