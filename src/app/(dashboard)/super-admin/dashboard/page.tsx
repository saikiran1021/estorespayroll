'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { summarizeInboxForEmployee } from '@/ai/flows/summarize-inbox-for-employee';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
        <Card>
            <CardHeader>
                <CardTitle>Inbox Summary (AI)</CardTitle>
                <CardDescription>Get a quick summary of important emails using AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleSummarize} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Summarize Inbox
                </Button>
                {summary && (
                    <Alert>
                        <AlertTitle>Email Summary</AlertTitle>
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
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Super Admin Dashboard</CardTitle>
                <CardDescription>Full system access and overview.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Manage all users, view system-wide logs, and perform critical actions.</p>
            </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">User tables, logs, and work progress charts will be displayed here.</p>
                </CardContent>
            </Card>
             <InboxSummary />
        </div>
    </div>
  );
}
