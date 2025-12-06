'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(firebaseUser);
          setUserRole(userData.role);
          setEmployeeId(userData.employeeId || null);
          
          const targetPath = roleRedirects[userData.role as keyof typeof roleRedirects];
          if(publicRoutes.includes(pathname)){
            router.push(targetPath || '/login');
          }

        } else {
          // User exists in Auth but not in Firestore, log them out.
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
