'use client';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfile() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  if (!user) return null;
  
  const initials = user.displayName?.split(' ').map(n => n[0]).join('') || user.email?.charAt(0).toUpperCase() || 'U';


  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className='overflow-hidden'>
        <p className="font-semibold truncate">{user.displayName || user.email}</p>
        <p className="text-xs text-muted-foreground">{userRole}</p>
      </div>
    </div>
  );
}
