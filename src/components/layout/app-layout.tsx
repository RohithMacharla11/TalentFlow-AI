
'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Calendar, Users, ListTodo, Bot, BarChart, Bell } from 'lucide-react';
import { Chatbot } from '../chatbot';
import { useAuth } from '@/contexts/auth-context';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const allNavItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Project Manager', 'Team Member'] },
    { href: '/allocations', label: 'Allocations', icon: ListTodo, roles: ['Administrator', 'Project Manager'] },
    { href: '/requests', label: 'Requests', icon: Bell, roles: ['Administrator', 'Project Manager'] },
    { href: '/calendar', label: 'Calendar', icon: Calendar, roles: ['Administrator', 'Project Manager', 'Team Member'] },
    { href: '/teams', label: 'Teams', icon: Users, roles: ['Administrator', 'Project Manager'] },
    { href: '/insights', label: 'Graphs & Insights', icon: BarChart, roles: ['Administrator', 'Project Manager'] },
  ];

  const navItems = allNavItems.filter(item => user?.role && item.roles.includes(user.role));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="group-data-[collapsible=icon]:border-r">
          <SidebarHeader className="h-16 flex items-center justify-center p-2">
            <Link href="/" className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary" />
              <div className="font-headline text-lg font-semibold group-data-[collapsible=icon]:hidden">
                TalentFlow
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
          <Chatbot />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
