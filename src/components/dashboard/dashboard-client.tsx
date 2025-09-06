
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectsTable } from './projects-table';
import { ResourcesTable } from './resources-table';
import type { Project, Resource, Allocation } from '@/lib/types';
import { Briefcase, Users, FileText } from 'lucide-react';
import { AddProjectModal } from './add-project-modal';
import { AddResourceModal, ResourceFormValues } from './add-resource-modal';
import { ImportCvModal } from './import-cv-modal';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

export function DashboardClient() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<ResourceFormValues> | undefined>();

  useEffect(() => {
    // General queries for Admin/PM
    const qProjects = query(collection(db, "projects"));
    const qResources = query(collection(db, "resources"));
    
    // Member-specific query for allocations
    let qAllocations;
    if (user?.role === 'Team Member') {
      // We need to find the resource ID that matches the user's UID
      const qUserResource = query(collection(db, "resources"), where("email", "==", user.email));
      onSnapshot(qUserResource, (resSnapshot) => {
        if (!resSnapshot.empty) {
            const resourceId = resSnapshot.docs[0].id;
            qAllocations = query(collection(db, "allocations"), where("resourceId", "==", resourceId));
             // Fetch allocations for this specific resource
            onSnapshot(qAllocations, (allocSnapshot) => {
                const allocationsData = allocSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Allocation));
                setAllocations(allocationsData);

                // Then fetch the projects for those allocations
                if (allocationsData.length > 0) {
                    const projectIds = [...new Set(allocationsData.map(a => a.projectId))];
                    const qMemberProjects = query(collection(db, "projects"), where("id", "in", projectIds));
                    onSnapshot(qMemberProjects, (projSnapshot) => {
                        const projectsData = projSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                        setProjects(projectsData);
                    });
                }
                 setLoading(false);
            });
        } else {
            setLoading(false);
        }
      });
    } else {
        // Admin and PM get all data
        onSnapshot(qProjects, (querySnapshot) => {
            const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(projectsData);
        });

        onSnapshot(qResources, (querySnapshot) => {
            const resourcesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
            setResources(resourcesData);
        });
        
        qAllocations = query(collection(db, "allocations"));
        onSnapshot(qAllocations, (querySnapshot) => {
            const allocationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Allocation));
            setAllocations(allocationsData);
        });
        setLoading(false);
    }
  }, [user]);

  // Team member view
  if (user?.role === 'Team Member') {
    return (
        <>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome, {user.displayName}</h1>
                <p className="text-muted-foreground">
                    Here are your current project assignments and tasks.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>My Projects</CardTitle>
                    <CardDescription>Projects you are currently assigned to.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading && <p>Loading projects...</p>}
                    {!loading && allocations.length === 0 && <p>You are not currently assigned to any projects.</p>}
                    {allocations.map(allocation => {
                        const project = projects.find(p => p.id === allocation.projectId);
                        if (!project) return null;
                        return (
                            <Link href={`/project/${project.id}`} key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                <div>
                                    <h3 className="font-semibold">{project.name}</h3>
                                    <p className="text-sm text-muted-foreground">{project.description}</p>
                                </div>
                                <div>
                                    <Badge variant="outline">{allocation.match}% Match</Badge>
                                </div>
                            </Link>
                        )
                    })}
                </CardContent>
            </Card>
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
