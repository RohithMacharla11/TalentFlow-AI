
'use client';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Resource, Project, Allocation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

type GroupedResources = {
  [key: string]: Resource[];
};

export default function TeamsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qResources = onSnapshot(query(collection(db, "resources")), (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
      checkLoading();
    });
    
    const qProjects = onSnapshot(query(collection(db, "projects")), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      checkLoading();
    });

    const qAllocations = onSnapshot(query(collection(db, "allocations")), (snapshot) => {
      setAllocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Allocation)));
      checkLoading();
    });

    const checkLoading = () => {
        // A bit simplistic, but good enough for this page.
        // It might flash the loading state briefly if collections load at different times.
        if (resources.length > 0 && projects.length > 0) {
            setLoading(false);
        }
    }

    return () => {
      qResources();
      qProjects();
      qAllocations();
    };
  }, [resources.length, projects.length]);

  const groupBy = (key: 'role' | 'seniority' | 'skills') => {
    return resources.reduce((acc, resource) => {
      if (key === 'skills') {
        resource.skills.forEach(skill => {
            if (!acc[skill]) acc[skill] = [];
            acc[skill].push(resource);
        });
      } else {
        const groupKey = resource[key];
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(resource);
      }
      return acc;
    }, {} as GroupedResources);
  };
  
  const byRole = groupBy('role');
  const bySeniority = groupBy('seniority');
  const bySkill = groupBy('skills');

  const byProject = projects.reduce((acc, project) => {
    const projectAllocations = allocations.filter(a => a.projectId === project.id);
    if (projectAllocations.length > 0) {
      acc[project.name] = projectAllocations.map(a => resources.find(r => r.id === a.resourceId)).filter(r => r !== undefined) as Resource[];
    }
    return acc;
  }, {} as GroupedResources);


  const renderGroup = (groupedData: GroupedResources, linkTo: 'resource' | 'project' = 'resource') => {
     if (loading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="flex items-center gap-4 p-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
          ))}
        </div>
      )
    }
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(groupedData).map(([groupName, members]) => {
                const project = projects.find(p => p.name === groupName);
                return (
                 <Card key={groupName}>
                    <CardHeader>
                    {linkTo === 'project' && project ? (
                        <Link href={`/project/${project.id}`} className="hover:underline">
                            <CardTitle>{groupName} ({members.length})</CardTitle>
                        </Link>
                    ) : (
                        <CardTitle>{groupName} ({members.length})</CardTitle>
                    )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {members.map((member, index) => (
                        <Link href={`/resource/${member.id}`} key={`${member.id}-${index}`} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                        <Avatar>
                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        </Link>
                    ))}
                    </CardContent>
                </Card>
                )
            })}
        </div>
    )
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Teams</h1>
      </div>

      <Tabs defaultValue="role" className="space-y-4">
        <TabsList>
          <TabsTrigger value="role">By Role</TabsTrigger>
          <TabsTrigger value="seniority">By Seniority</TabsTrigger>
          <TabsTrigger value="skill">By Skill</TabsTrigger>
          <TabsTrigger value="project">By Project</TabsTrigger>
        </TabsList>
        <TabsContent value="role">
            {renderGroup(byRole)}
        </TabsContent>
        <TabsContent value="seniority">
            {renderGroup(bySeniority)}
        </TabsContent>
        <TabsContent value="skill">
            {renderGroup(bySkill)}
        </TabsContent>
         <TabsContent value="project">
            {renderGroup(byProject, 'project')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
