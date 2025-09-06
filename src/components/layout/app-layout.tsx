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
import { LayoutDashboard, Calendar, Users, Briefcase, Bot } from 'lucide-react';
import { Chatbot } from '../chatbot';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
  ];

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
