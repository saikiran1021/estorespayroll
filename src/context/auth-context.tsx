'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { useUser, useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export type UserRole = 'Employee' | 'Admin' | 'Super Admin' | 'College' | 'Industry' | null;

export interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  employeeId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  employeeId: null,
});

const publicRoutes = ['/login', '/signup'];

const roleRedirects: { [key: string]: string } = {
  'Super Admin': '/super-admin/dashboard',
  'Admin': '/admin/dashboard',
  'Employee': '/employee/dashboard',
  'College': '/college/dashboard',
  'Industry': '/industry/dashboard',
};

async function getUserRoleAndData(db: any, uid: string): Promise<{ role: UserRole, data: DocumentData | null }> {
    const roleCollections = {
        'roles_super_admin': 'Super Admin',
        'roles_admin': 'Admin',
        'roles_employee': 'Employee',
        'roles_college': 'College',
        'roles_industry': 'Industry',
    };

    for (const [collectionName, role] of Object.entries(roleCollections)) {
        try {
            const roleDocRef = doc(db, collectionName, uid);
            const roleDoc = await getDoc(roleDocRef);
            if (roleDoc.exists()) {
                const profileCollection = collectionName.replace('roles_', '') + 's';
                const userDocRef = doc(db, profileCollection, uid);
                const userDoc = await getDoc(userDocRef);
                return { role: role as UserRole, data: userDoc.exists() ? userDoc.data() : null };
            }
        } catch (error) {
            console.error(`Error checking role in ${collectionName}:`, error);
            // Continue to the next role check
        }
    }
    return { role: null, data: null };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: firebaseUser, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useFirebaseAuth();

  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleAuthChange = async () => {
      setAuthLoading(true);
      
      if (isUserLoading) {
        return; 
      }
      
      if (firebaseUser) {
        const { role, data } = await getUserRoleAndData(db, firebaseUser.uid);
        setUserRole(role);
        setEmployeeId(data?.employeeId || null);
        
        const isPublicRoute = publicRoutes.includes(pathname);
        
        if (role) {
          const targetPath = roleRedirects[role as keyof typeof roleRedirects];
          if (isPublicRoute) {
            setIsRedirecting(true);
            router.replace(targetPath);
            return;
          }
        } else {
          // User exists in Auth but not in a role collection, log them out.
          await auth.signOut();
          if (!isPublicRoute) {
            setIsRedirecting(true);
            router.replace('/login');
            return;
          }
        }
      } else {
        setUserRole(null);
        setEmployeeId(null);
        if (!publicRoutes.includes(pathname)) {
            setIsRedirecting(true);
            router.replace('/login');
            return;
        }
      }
      setAuthLoading(false);
      setIsRedirecting(false);
    };

    handleAuthChange();
  }, [firebaseUser, isUserLoading, pathname, db, auth, router]);

  const loading = isUserLoading || authLoading || isRedirecting;
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: firebaseUser, userRole, loading: authLoading, employeeId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
