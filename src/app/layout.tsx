import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import {cn} from '@/lib/utils';
import {Toaster} from '@/components/ui/toaster';
import {AuthProvider} from '@/context/auth-context';

const inter = Inter({subsets: ['latin'], variable: '--font-body'});

export const metadata: Metadata = {
  title: 'eStores WorkHub Pay Portal',
  description: 'Employee management portal for eStores WorkHub.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen font-body antialiased', inter.variable)}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
