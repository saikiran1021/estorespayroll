'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, DocumentData, Firestore } from 'firebase/firestore';
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
const roleDashboardMap: Record<string, string> = {
    'Super Admin': '/super-admin/dashboard',
    'Admin': '/admin/dashboard',
    'Employee': '/employee/dashboard',
    'College': '/college/dashboard',
    'Industry': '/industry/dashboard',
};

async function getUserRoleAndData(db: Firestore, uid: string): Promise<{ role: UserRole, data: DocumentData | null }> {
    const roleCollections: Record<string, UserRole> = {
        'roles_super_admin': 'Super Admin',
        'roles_admin': 'Admin',
        'roles_employee': 'Employee',
        'roles_college': 'College',
        'roles_industry': 'Industry',
    };

    for (const collectionName of Object.keys(roleCollections)) {
        const roleDocRef = doc(db, collectionName, uid);
        const roleDocSnap = await getDoc(roleDocRef);
        if (roleDocSnap.exists()) {
            const role = roleCollections[collectionName];
            const profileCollection = collectionName.replace('roles_', '') + 's';
            const userDocRef = doc(db, profileCollection, uid);
            const userDocSnap = await getDoc(userDocRef);
            return {
                role,
                data: userDocSnap.exists() ? userDocSnap.data() : null,
            };
        }
    }

    return { role: null, data: null };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is still checking the user, we wait.
    if (isUserLoading) {
        setLoading(true);
        return;
    }

    // If there is no user logged in...
    if (!user) {
        setUserRole(null);
        setEmployeeId(null);
        // And they are not on a public route, redirect them to login.
        if (!publicRoutes.includes(pathname)) {
            router.replace('/login');
        } else {
            setLoading(false);
        }
        return;
    }

    // If there IS a user logged in...
    let isMounted = true;
    getUserRoleAndData(db, user.uid).then(({ role, data }) => {
        if (!isMounted) return;

        setUserRole(role);
        setEmployeeId(data?.employeeId ?? null);

        const isPublicRoute = publicRoutes.includes(pathname);
        
        if (role) {
            // User has a valid role. Get their target dashboard.
            const targetPath = roleDashboardMap[role];
            // If they are on a public route (like /login), redirect them to their dashboard.
            if (isPublicRoute) {
                router.replace(targetPath);
            } else {
                setLoading(false);
            }
        } else {
            // User is authenticated with Firebase but has NO role in Firestore.
            // This is an invalid state, so log them out and send to login.
            auth.signOut();
            if (!isPublicRoute) {
                router.replace('/login');
            } else {
                 setLoading(false);
            }
        }
    });

    return () => {
        isMounted = false;
    };
}, [user, isUserLoading, pathname, db, auth, router]);

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
    <AuthContext.Provider value={{ user, userRole, loading, employeeId }}>
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
