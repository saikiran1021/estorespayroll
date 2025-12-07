'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { summarizeInboxForEmployee } from '@/ai/flows/summarize-inbox-for-employee';
import { Loader2, ShieldCheck, Users, Briefcase, CalendarCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthContext } from '@/context/auth-context';
import { LogoutButton } from '../../components/logout-button';


const mockEmails = [
    "From: team@example.com\nSubject: Project Phoenix Update\n\nHi Team,\nJust a quick update on Project Phoenix. We've hit a major milestone with the deployment of the beta version. Please test it out and provide feedback by EOD Friday. Thanks!",
    "From: hr@example.com\nSubject: Annual Performance Review\n\nDear employees,\nThis is a reminder that your annual performance self-assessment is due next Monday. Please complete it in the portal. Your manager will then schedule a meeting with you.",
    "From: it@example.com\nSubject: Urgent: Security Patch Required\n\nPlease update your laptops with the latest security patch immediately. Instructions are attached. This is mandatory to protect against recent threats.",
];


function InboxSummary() {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSummarize = async () => {
        setLoading(true);
        setError('');
        setSummary('');
        try {
            const result = await summarizeInboxForEmployee({ emails: mockEmails });
            setSummary(result.summary);
        } catch (e) {
            setError('Failed to generate summary.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Inbox Summary (AI)</CardTitle>
                <CardDescription>Use AI to get a quick summary of important system-wide communications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleSummarize} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Generate Summary
                </Button>
                {summary && (
                    <Alert>
                        <AlertTitle>AI-Generated Summary</AlertTitle>
                        <AlertDescription className="whitespace-pre-wrap">{summary}</AlertDescription>
                    </Alert>
                )}
                 {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}

export default function SuperAdminDashboard() {
  const { user } = useAuthContext();
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Welcome, Super Admin!</CardTitle>
                <CardDescription>You have full system access. Use these powers wisely.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Logged in as: <span className="font-semibold">{user?.email}</span></p>
            </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">User Management</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Manage all user roles and permissions.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Work Progress</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Oversee employee and admin task completion.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System-wide Attendance</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Monitor attendance logs for all users.</p>
                </CardContent>
            </Card>

            <InboxSummary />
            
            <Card>
                <CardHeader>
                    <CardTitle>System Security</CardTitle>
                    <CardDescription>Access security logs and system settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-green-600">
                        <ShieldCheck className="h-5 w-5 mr-2" />
                        <span>System is secure.</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-end">
                <LogoutButton variant="destructive" className="w-auto">
                    Exit Dashboard
                </LogoutButton>
            </CardContent>
        </Card>
    </div>
  );
}
