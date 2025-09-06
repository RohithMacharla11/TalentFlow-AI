'use client';
import { CalendarView } from "@/components/calendar-view";
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, Resource, Allocation } from '@/lib/types';


export default function CalendarPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qProjects = query(collection(db, "projects"));
    const unsubscribeProjects = onSnapshot(qProjects, (querySnapshot) => {
      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
      setLoading(false);
    });

    const qResources = query(collection(db, "resources"));
    const unsubscribeResources = onSnapshot(qResources, (querySnapshot) => {
      const resourcesData: Resource[] = [];
      querySnapshot.forEach((doc) => {
        resourcesData.push({ id: doc.id, ...doc.data() } as Resource);
      });
      setResources(resourcesData);
    });

    const qAllocations = query(collection(db, "allocations"));
    const unsubscribeAllocations = onSnapshot(qAllocations, (querySnapshot) => {
        const allocationsData: Allocation[] = [];
        querySnapshot.forEach((doc) => {
            allocationsData.push({ ...doc.data() } as Allocation);
        });
        setAllocations(allocationsData);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeResources();
      unsubscribeAllocations();
    };
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Calendar View</h1>
      </div>
      <CalendarView projects={projects} resources={resources} allocations={allocations} />
    </div>
  );
}
