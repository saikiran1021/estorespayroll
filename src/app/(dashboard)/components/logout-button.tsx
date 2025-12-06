'use client';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    const { toast } = useToast();
    const router = useRouter();

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
        <Button variant="ghost" className="w-full justify-start text-foreground" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    )
}
