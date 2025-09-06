
'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex min-h-screen">
        <div className="hidden md:block">
            <div className="h-svh w-[16rem] p-2 space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-[calc(100%-5rem)] w-full" />
            </div>
        </div>
        <div className="flex-1 p-2 md:m-2 md:rounded-lg">
            <Skeleton className="h-16 w-full" />
            <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
                <div className="flex items-center space-x-2 pt-8">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="pt-4 space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        </div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
