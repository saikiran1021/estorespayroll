'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Inbox, Send } from 'lucide-react';

type Mail = {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  subject: string;
  body: string;
  timestamp: { seconds: number };
  isRead: boolean;
};

interface MailDisplayProps {
  receivedMail: Mail[];
  sentMail: Mail[];
  isLoading: boolean;
}

export default function MailDisplay({ receivedMail, sentMail, isLoading }: MailDisplayProps) {
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);

  const getInitials = (email: string) => email?.charAt(0).toUpperCase() || 'U';
  
  const MailList = ({ mails, type }: { mails: Mail[]; type: 'received' | 'sent' }) => (
    <ScrollArea className="h-[400px]">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {mails.length === 0 && <p className="text-center text-muted-foreground pt-4">No messages yet.</p>}
        {mails.map((mail) => (
          <button
            key={mail.id}
            className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent ${selectedMail?.id === mail.id && 'bg-accent'}`}
            onClick={() => setSelectedMail(mail)}
          >
            <div className="flex w-full items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{getInitials(type === 'received' ? mail.senderEmail : mail.receiverEmail)}</AvatarFallback>
                </Avatar>
                <div className="font-semibold">{type === 'received' ? mail.senderEmail : mail.receiverEmail}</div>
              </div>
              <div className={`ml-auto text-xs ${selectedMail?.id === mail.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {formatDistanceToNow(new Date(mail.timestamp.seconds * 1000), { addSuffix: true })}
              </div>
            </div>
            <div className="text-xs font-medium">{mail.subject}</div>
            <div className={`line-clamp-2 text-xs ${!mail.isRead && type === 'received' ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
              {mail.body}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Tabs defaultValue="inbox" className="md:col-span-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inbox"><Inbox className="mr-2 h-4 w-4" /> Inbox ({receivedMail.length})</TabsTrigger>
          <TabsTrigger value="sent"><Send className="mr-2 h-4 w-4" /> Sent ({sentMail.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
            {isLoading ? <div className="flex justify-center items-center h-[400px]"><Loader2 className="animate-spin" /></div> : <MailList mails={receivedMail} type="received" />}
        </TabsContent>
        <TabsContent value="sent">
            {isLoading ? <div className="flex justify-center items-center h-[400px]"><Loader2 className="animate-spin" /></div> : <MailList mails={sentMail} type="sent" />}
        </TabsContent>
      </Tabs>
      <div className="md:col-span-2">
        <Card className="h-full">
            <CardContent className="p-4 h-full">
                {selectedMail ? (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center p-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{getInitials(selectedMail.senderEmail)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 grid gap-1">
                                <p className="text-sm font-semibold">From: {selectedMail.senderEmail}</p>
                                <p className="text-sm text-muted-foreground">To: {selectedMail.receiverEmail}</p>
                            </div>
                            <div className="ml-auto text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(selectedMail.timestamp.seconds * 1000), { addSuffix: true })}
                            </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
                            <p className="font-bold mb-4">{selectedMail.subject}</p>
                            {selectedMail.body}
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <p>Select a message to read</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
