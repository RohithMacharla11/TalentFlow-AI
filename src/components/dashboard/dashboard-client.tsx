
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectsTable } from './projects-table';
import { ResourcesTable } from './resources-table';
import type { Project, Resource, Allocation, ProjectRequest } from '@/lib/types';
import { Briefcase, Users, FileText } from 'lucide-react';
import { AddProjectModal } from './add-project-modal';
import { AddResourceModal, ResourceFormValues } from './add-resource-modal';
import { ImportCvModal } from './import-cv-modal';
import { useAuth } from '@/contexts/auth-context';
import { getResourceByEmail } from '@/services/firestore-service';
import { Skeleton } from '../ui/skeleton';

export function DashboardClient() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [currentUserResource, setCurrentUserResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResourceProfile, setLoadingResourceProfile] = useState(true);
  
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<ResourceFormValues> | undefined>();

  useEffect(() => {
    const fetchAndSetCurrentUserResource = async (email: string) => {
        setLoadingResourceProfile(true);
        const resourceProfile = await getResourceByEmail(email);
        setCurrentUserResource(resourceProfile);
        setLoadingResourceProfile(false);
    };

    if (user?.role === 'Team Member' && user.email) {
        fetchAndSetCurrentUserResource(user.email);
    } else {
        setLoadingResourceProfile(false);
    }
  }, [user]);

  useEffect(() => {
    const qProjects = query(collection(db, "projects"));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        setLoading(false);
    });

    const qResources = query(collection(db, "resources"));
    const unsubscribeResources = onSnapshot(qResources, (snapshot) => {
        setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
    });

    const qAllocations = query(collection(db, "allocations"));
    const unsubscribeAllocations = onSnapshot(qAllocations, (snapshot) => {
        setAllocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Allocation)));
    });
    
    const qRequests = query(collection(db, "requests"), where("status", "==", "pending"));
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
        setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectRequest)));
    });
    
    return () => {
        unsubscribeProjects();
        unsubscribeResources();
        unsubscribeAllocations();
        unsubscribeRequests();
    }
  }, []);

  // Team member view
  if (user?.role === 'Team Member') {
    const assignedProjectIds = allocations.filter(a => a.resourceId === currentUserResource?.id).map(a => a.projectId);
    const assignedProjects = projects.filter(p => assignedProjectIds.includes(p.id));

    return (
        <>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome, {user.displayName}</h1>
                <p className="text-muted-foreground">
                    Here are your current project assignments and available projects you can request to join.
                </p>
            </div>
             <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>My Projects</CardTitle>
                    <CardDescription>Projects you are currently assigned to.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProjectsTable projects={assignedProjects} resources={resources} allocations={allocations} loading={loading || loadingResourceProfile} />
                </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Available Projects</CardTitle>
                    <CardDescription>Projects you can request to join.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading || loadingResourceProfile ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <ProjectsTable 
                            projects={projects.filter(p => !assignedProjectIds.includes(p.id))} 
                            resources={resources} 
                            allocations={allocations} 
                            loading={false}
                            requests={requests}
                            currentUserResource={currentUserResource}
                        />
                    )}
                </CardContent>
                </Card>
            </div>
        </>
    )
  }

  // Admin and Project Manager view
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
          {user?.role === 'Administrator' && <AddProjectModal />}
          {user?.role === 'Administrator' && <ImportCvModal setPrefillData={setPrefillData} setAddResourceOpen={setIsAddResourceOpen} />}
          {user?.role === 'Administrator' && 
            <AddResourceModal 
              open={isAddResourceOpen}
              setOpen={setIsAddResourceOpen}
              prefillData={prefillData}
            />
          }
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
