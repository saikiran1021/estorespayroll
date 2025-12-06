'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
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

async function getUserRoleAndData(uid: string): Promise<{ role: UserRole, data: DocumentData | null }> {
    const roleCollections = {
        'roles_super_admin': 'Super Admin',
        'roles_admin': 'Admin',
        'roles_employee': 'Employee',
        'roles_college': 'College',
        'roles_industry': 'Industry',
    };

    for (const [collectionName, role] of Object.entries(roleCollections)) {
        const roleDocRef = doc(db, collectionName, uid);
        const roleDoc = await getDoc(roleDocRef);
        if (roleDoc.exists()) {
            const profileCollection = collectionName.replace('roles_', '') + 's';
            const userDocRef = doc(db, profileCollection, uid);
            const userDoc = await getDoc(userDocRef);
            return { role: role as UserRole, data: userDoc.exists() ? userDoc.data() : null };
        }
    }
    return { role: null, data: null };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { role, data } = await getUserRoleAndData(firebaseUser.uid);
        if (role && data) {
          setUser(firebaseUser);
          setUserRole(role);
          setEmployeeId(data.employeeId || null);
          
          const targetPath = roleRedirects[role as keyof typeof roleRedirects];
          if(publicRoutes.includes(pathname)){
            router.push(targetPath || '/login');
          }
        } else {
          // User exists in Auth but not in a role collection, log them out.
          await auth.signOut();
          setUser(null);
          setUserRole(null);
          setEmployeeId(null);
          router.push('/login');
        }
      } else {
        setUser(null);
        setUserRole(null);
        setEmployeeId(null);
        if (!publicRoutes.includes(pathname)) {
            router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

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
  
  if (!publicRoutes.includes(pathname) && !user) {
    return null; // Don't render protected pages if user is not logged in
  }

  if(publicRoutes.includes(pathname) && user){
    return null; // Don't render login/signup if user is logged in
  }


  return (
    <AuthContext.Provider value={{ user, userRole, loading, employeeId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
