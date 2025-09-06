'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, Resource, Allocation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { AiSuggestions } from "@/components/project/ai-suggestions";

export default function ProjectDetailPage({ params }: { params: { id:string } }) {
    const [project, setProject] = useState<Project | null>(null);
    const [allocatedResources, setAllocatedResources] = useState<(Allocation & { resource?: Resource })[]>([]);
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            const projectDoc = await getDoc(doc(db, "projects", params.id));
            if (projectDoc.exists()) {
                setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
            } else {
                notFound();
            }
            setLoading(false);
        };
        fetchProject();

        const qResources = query(collection(db, "resources"));
        const unsubscribeResources = onSnapshot(qResources, (snapshot) => {
            const resourcesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
            setAllResources(resourcesData);
        });

        return () => unsubscribeResources();

    }, [params.id]);

    useEffect(() => {
        if (!project) return;
        
        const qAllocations = query(collection(db, "allocations"), where("projectId", "==", project.id));
        const unsubscribeAllocations = onSnapshot(qAllocations, (snapshot) => {
             const allocationsData = snapshot.docs.map(doc => doc.data() as Allocation);
             const populatedAllocations = allocationsData.map(alloc => {
                const resource = allResources.find(r => r.id === alloc.resourceId);
                return { ...alloc, resource };
             });
             setAllocatedResources(populatedAllocations);
        });

        return () => unsubscribeAllocations();

    }, [project, allResources]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!project) {
        return notFound();
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">{project.name}</h1>
                    <p className="text-muted-foreground">{project.description}</p>
                </div>
                <Badge variant={project.priority === 'High' ? 'destructive' : project.priority === 'Medium' ? 'secondary' : 'outline'}>
                    {project.priority} Priority
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
                        <div>
                            <strong>Required Skills:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {project.requiredSkills.map(skill => (
                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="md:col-span-2">
                     <Tabs defaultValue="allocated">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="allocated">Allocated Resources</TabsTrigger>
                            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
                            <TabsTrigger value="logs">Logs</TabsTrigger>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="allocated">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Allocated Resources</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {allocatedResources.length > 0 ? (
                                        <div className="space-y-4">
                                            {allocatedResources.map(({ resource, match, status }).map((resource) =>
                resource ? (
                  <Avatar key={resource.id} className="border-2 border-card">
                    <AvatarImage src={resource.avatar} alt={resource.name} />
                    <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : null
              )}
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No resources allocated yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="suggestions">
                             <AiSuggestions project={project} allResources={allResources} />
                         </TabsContent>
                         <TabsContent value="logs">
                             <Card>
                                 <CardHeader>
                                     <CardTitle>Explainability Logs</CardTitle>
                                     <CardDescription>Reasoning behind each allocation.</CardDescription>
                                 </Header>
                                 <CardContent>
                                     <p className="text-muted-foreground">View detailed allocation rationale from the main dashboard by clicking the "Why?" button on a project row.</p>
                                 </CardContent>
                             </Card>
                         </TabsContent>
                         <TabsContent value="overview">
                             <Card>
                                 <CardHeader>
                                     <CardTitle>Project Overview</CardTitle>
                                 </Header>
                                 <CardContent>
                                     <p className="text-muted-foreground">Project overview will be implemented here.</p>
                                 </CardContent>
                             </Card>
                         </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
