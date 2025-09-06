
'use client';
import { CalendarView } from "@/components/calendar-view";
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, Resource, Allocation } from '@/lib/types';
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";


export default function CalendarPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserResource, setCurrentUserResource] = useState<Resource | null>(null);

  useEffect(() => {
    // General data fetching
    const qProjects = query(collection(db, "projects"));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });

    const qResources = query(collection(db, "resources"));
    const unsubResources = onSnapshot(qResources, (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
    });
    
    const qAllocations = query(collection(db, "allocations"));
    const unsubAllocations = onSnapshot(qAllocations, (snapshot) => {
        setAllocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Allocation)));
    });
    
    return () => {
      unsubProjects();
      unsubResources();
      unsubAllocations();
    };
  }, []);

  useEffect(() => {
    if (user?.role === 'Team Member' && user.email) {
      const q = query(collection(db, "resources"), where("email", "==", user.email));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setCurrentUserResource({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Resource);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredAllocations = user?.role === 'Team Member' && currentUserResource
    ? allocations.filter(a => a.resourceId === currentUserResource.id)
    : allocations;

  if (loading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-8 w-48" />
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <Skeleton className="h-8 w-1/4" />
                    <div className="space-x-2">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[500px] w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Calendar View</h1>
      </div>
      <CalendarView projects={projects} resources={resources} allocations={filteredAllocations} />
    </div>
  );
}
