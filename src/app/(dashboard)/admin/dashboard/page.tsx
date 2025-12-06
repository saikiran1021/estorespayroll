import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Welcome to the control center.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>From here you can manage employees, track revenue, and more.</p>
            </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Revenue chart will be displayed here.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Employee Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Attendance table will be displayed here.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Assign Work</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Task assignment form will be here.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
