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

async function getUserRoleAndData(db: Firestore, uid: string, selectedRole: string | null): Promise<{ role: UserRole, data: DocumentData | null }> {
    const roleCollections: [string, UserRole][] = [
        ['roles_super_admin', 'Super Admin'],
        ['roles_admin', 'Admin'],
        ['roles_employee', 'Employee'],
        ['roles_college', 'College'],
        ['roles_industry', 'Industry'],
    ];

    // If a role was selected at login, check that first for a faster redirect.
    if (selectedRole) {
        const roleInfo = roleCollections.find(rc => rc[1] === selectedRole);
        if (roleInfo) {
            const [collectionName, role] = roleInfo;
            const roleDocRef = doc(db, collectionName, uid);
            const roleDocSnap = await getDoc(roleDocRef);
            if (roleDocSnap.exists()) {
                const profileCollection = collectionName.replace('roles_', '') + 's';
                const userDocRef = doc(db, profileCollection, uid);
                const userDocSnap = await getDoc(userDocRef);
                return {
                    role,
                    data: userDocSnap.exists() ? userDocSnap.data() : null,
                };
            }
        }
    }


    // Fallback to iterating through all roles if no specific role was provided or found.
    for (const [collectionName, role] of roleCollections) {
        const roleDocRef = doc(db, collectionName, uid);
        const roleDocSnap = await getDoc(roleDocRef);
        if (roleDocSnap.exists()) {
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

  const [authContextValue, setAuthContextValue] = useState<AuthContextType>({
    user: null,
    userRole: null,
    loading: true,
    employeeId: null,
  });

  useEffect(() => {
    if (isUserLoading) {
        setAuthContextValue(prev => ({ ...prev, loading: true }));
        return;
    }

    const isPublicRoute = publicRoutes.includes(pathname);
    const selectedRole = sessionStorage.getItem('selectedRole'); // Role from login form

    if (user) {
        getUserRoleAndData(db, user.uid, selectedRole).then(({ role, data }) => {
            const newContext: AuthContextType = {
                user: user,
                userRole: role,
                employeeId: data?.employeeId ?? null,
                loading: false
            };
            setAuthContextValue(newContext);

            if (role) {
                const targetDashboard = roleDashboardMap[role];
                if (isPublicRoute) {
                    router.replace(targetDashboard);
                    sessionStorage.removeItem('selectedRole'); // Clean up after redirect
                }
            } else {
                auth.signOut();
                if (!isPublicRoute) {
                    router.replace('/login');
                }
            }
        });
    } else {
        setAuthContextValue({ user: null, userRole: null, employeeId: null, loading: false });
        if (!isPublicRoute) {
            router.replace('/login');
        }
    }
  }, [user, isUserLoading, pathname, db, auth, router]);

  if (authContextValue.loading) {
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
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
