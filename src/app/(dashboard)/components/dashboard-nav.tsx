'use client';

import { useAuthContext, UserRole } from '@/context/auth-context';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building,
  GraduationCap,
  FileText,
  DollarSign,
  Mail,
  ClipboardCheck,
  CalendarCheck,
  LogIn
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
};

const navItems: NavItem[] = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin'] },
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin'] },
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Employee'] },
  { href: '/college/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['College'] },
  { href: '/industry/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Industry'] },
  
  // Super Admin
  { href: '/super-admin/users', label: 'Manage Users', icon: Users, roles: ['Super Admin'] },
  { href: '/super-admin/attendance', label: 'Attendance Logs', icon: CalendarCheck, roles: ['Super Admin'] },
  { href: '/super-admin/tasks', label: 'Work Progress', icon: ClipboardCheck, roles: ['Super Admin'] },
  { href: '/super-admin/mailbox', label: 'Mailbox', icon: Mail, roles: ['Super Admin'] },

  // Admin
  { href: '/admin/revenue', label: 'Revenue', icon: DollarSign, roles: ['Admin'] },
  { href: '/admin/payslip', label: 'Payslip', icon: DollarSign, roles: ['Admin'] },
  { href: '/admin/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['Admin'] },
  { href: '/admin/tasks', label: 'Assign Work', icon: Briefcase, roles: ['Admin'] },
  { href: '/admin/logins', label: 'Employee Logins', icon: LogIn, roles: ['Admin'] },
  
  // Employee
  { href: '/employee/documents', label: 'Documents', icon: FileText, roles: ['Employee'] },
  { href: '/employee/payslip', label: 'Payslip', icon: DollarSign, roles: ['Employee'] },
  { href: '/employee/tasks', label: 'Assigned Work', icon: Briefcase, roles: ['Employee'] },
  { href: '/employee/mailbox', label: 'Mailbox', icon: Mail, roles: ['Employee'] },
  
  // These were causing issues, so they are commented out until they are properly implemented
  // { href: '/industry/data', label: 'Industry Data', icon: Building, roles: ['Admin', 'Employee'] },
  // { href: '/college/data', label: 'College Data', icon: GraduationCap, roles: ['Admin', 'Employee'] },
];

export default function DashboardNav() {
  const { userRole } = useAuthContext();
  const pathname = usePathname();

  if (!userRole) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {filteredNavItems.map(item => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
            className="text-foreground"
          >
            <a href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
