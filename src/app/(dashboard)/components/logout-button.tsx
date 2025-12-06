'use client';
import { Button, ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps extends ButtonProps {
    children?: React.ReactNode;
}

export function LogoutButton({ children, className, ...props }: LogoutButtonProps) {
    const { toast } = useToast();
    const router = useRouter();
    const auth = useAuth();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
            router.push('/login');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Logout Failed', description: error.message });
        }
    };

    return (
        <Button 
            className={cn('w-full justify-start text-foreground', className)} 
            onClick={handleLogout}
            {...props}
        >
            <LogOut className="mr-2 h-4 w-4" />
            {children || 'Logout'}
        </Button>
    )
}
