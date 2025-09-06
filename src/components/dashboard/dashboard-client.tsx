'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectsTable } from './projects-table';
import { ResourcesTable } from './resources-table';
import type { Project, Resource, Allocation } from '@/lib/types';
import { Briefcase, Users } from 'lucide-react';
import { AddProjectModal } from './add-project-modal';
import { AddResourceModal, ResourceFormValues } from './add-resource-modal';
import { ImportCvModal } from './import-cv-modal';

export function DashboardClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<ResourceFormValues> | undefined>();

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
            allocationsData.push({ id: doc.id, ...doc.data() } as Allocation);
        });
        setAllocations(allocationsData);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeResources();
      unsubscribeAllocations();
    };
  }, []);
  
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your projects and resources with intelligent insights.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <AddProjectModal />
          <ImportCvModal setPrefillData={setPrefillData} setAddResourceOpen={setIsAddResourceOpen} />
          <AddResourceModal 
            open={isAddResourceOpen}
            setOpen={setIsAddResourceOpen}
            prefillData={prefillData}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-headline text-2xl font-bold">Projects</CardTitle>
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ProjectsTable projects={projects} resources={resources} allocations={allocations} loading={loading} />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-headline text-2xl font-bold">Available Resources</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResourcesTable resources={resources} projects={projects} allocations={allocations} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
