
'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectsTable } from './projects-table';
import { ResourcesTable } from './resources-table';
import type { Project, Resource, Allocation, ProjectRequest } from '@/lib/types';
import { Briefcase, Users, UserPlus } from 'lucide-react';
import { AddProjectModal } from './add-project-modal';
import { AddResourceModal, ResourceFormValues } from './add-resource-modal';
import { ImportCvModal } from './import-cv-modal';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '../ui/skeleton';
import { ResourceAiSuggestions } from '../resource/resource-ai-suggestions';
import { useToast } from '@/hooks/use-toast';

export function DashboardClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [currentUserResource, setCurrentUserResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResourceProfile, setLoadingResourceProfile] = useState(true);
  
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<ResourceFormValues> | undefined>();

  // State for AI suggestions modal
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [selectedResourceForSuggestion, setSelectedResourceForSuggestion] = useState<Resource | null>(null);
  const [targetProjectForSuggestion, setTargetProjectForSuggestion] = useState<Project | null>(null);


  useEffect(() => {
    if (user?.role === 'Team Member' && user.email) {
        setLoadingResourceProfile(true);
        const q = query(collection(db, "resources"), where("email", "==", user.email));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const docData = snapshot.docs[0];
                setCurrentUserResource({ id: docData.id, ...docData.data() } as Resource);
            } else {
                setCurrentUserResource(null);
            }
            setLoadingResourceProfile(false);
        });
        return () => unsubscribe();
    } else {
        setLoadingResourceProfile(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    if (over && over.data.current?.type === 'project' && active.data.current?.type === 'resource') {
        const resource = active.data.current.resource as Resource;
        const project = over.data.current.project as Project;
        
        if (projects.length === 0) {
          toast({
            title: "No Projects Available",
            description: "Please add a project before getting suggestions.",
            variant: "destructive",
          });
          return;
        }

        toast({
            title: 'Analyzing Fit...',
            description: `Checking suitability of ${resource.name} for ${project.name}.`,
        });

        setSelectedResourceForSuggestion(resource);
        setTargetProjectForSuggestion(project);
        setSuggestionModalOpen(true);
    }
  };

  if (user?.role === 'Team Member') {
    if (loadingResourceProfile) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-6 w-1/2" />
            </div>
        )
    }

    if (!currentUserResource) {
        return (
             <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-card mt-8">
                <UserPlus className="h-16 w-16 text-primary mb-4" />
                <h2 className="text-2xl font-bold font-headline mb-2">Welcome to TalentFlow, {user.displayName}!</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    To get started and join projects, you need to complete your resource profile.
                    This helps project managers find you for the right tasks.
                </p>
                <AddResourceModal 
                    open={isAddResourceOpen} 
                    setOpen={setIsAddResourceOpen} 
                    prefillData={{ name: user.displayName || '', email: user.email || ''}}
                    isCompletingProfile
                />
            </div>
        )
    }

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
                    <ProjectsTable 
                        projects={assignedProjects} 
                        resources={resources} 
                        allocations={allocations} 
                        loading={loading || loadingResourceProfile} 
                        isMyProjects={true}
                    />
                </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Available Projects</CardTitle>
                    <CardDescription>Projects you can request to join.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading || loadingResourceProfile ? (
                        <div className="space-y-2 p-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
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
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your projects and resources. Drag a resource to a project to assign them.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {user?.role !== 'Team Member' && <AddProjectModal />}
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
      {selectedResourceForSuggestion && (
          <ResourceAiSuggestions
              resource={selectedResourceForSuggestion}
              allProjects={projects}
              open={suggestionModalOpen}
              onOpenChange={(isOpen) => {
                setSuggestionModalOpen(isOpen);
                if (!isOpen) {
                    setTargetProjectForSuggestion(null);
                }
              }}
              targetProject={targetProjectForSuggestion}
          />
      )}
    </DndContext>
  );
}
