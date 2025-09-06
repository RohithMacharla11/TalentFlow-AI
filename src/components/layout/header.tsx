'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '../ui/button';

export function Header() {
  const { user, signOutUser } = useAuth();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1" />
      <ThemeToggle />
      {user && (
        <Button variant="outline" onClick={signOutUser}>Sign Out</Button>
      )}
    </header>
  );
}
