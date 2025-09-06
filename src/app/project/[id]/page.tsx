
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, Resource, Allocation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound, useParams, useRouter } from "next/navigation";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Pen, Sparkles, Zap, ArrowLeft, FileText, CheckCircle, Users } from 'lucide-react';
import { ProjectAiSuggestions } from '@/components/project/project-ai-suggestions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const projectId = params.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [allocatedResources, setAllocatedResources] = useState<(Allocation & { resource?: Resource })[]>([]);
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!projectId) return;
        const fetchProject = async () => {
            const projectDoc = await getDoc(doc(db, "projects", projectId));
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

        return () => {
            unsubscribeResources();
        };

    }, [projectId]);

    useEffect(() => {
        if (!project) return;

        const qAllocations = query(collection(db, "allocations"), where("projectId", "==", project.id));
        const unsubscribeAllocations = onSnapshot(qAllocations, (snapshot) => {
            const allocationsData = snapshot.docs.map(doc => {
                 const data = doc.data();
                 return { id: doc.id, ...data } as Allocation;
            });
            
            const populatedAllocations = allocationsData.map(alloc => {
                const resource = allResources.find(r => r.id === alloc.resourceId);
                return { ...alloc, resource };
            });
            setAllocatedResources(populatedAllocations);
        });

        return () => {
            unsubscribeAllocations();
        };
    }, [project, allResources]);

     const handleAiAssignClick = () => {
        if (allResources.length === 0) {
            toast({
                title: "No Resources Available",
                description: "Please add resources before using AI suggestions.",
                variant: "destructive",
            });
            return;
        }
        setIsSuggestionModalOpen(true);
    };

    if (loading) {
        return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6"><p>Loading...</p></div>;
    }

    if (!project) {
        return notFound();
    }

    const isManager = user?.role === 'Administrator' || user?.role === 'Project Manager';

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight font-headline">{project.name}</h1>
             </div>
            <div className="flex items-center justify-between space-y-2">
                <p className="text-muted-foreground">{project.description}</p>
                <div className="flex items-center gap-2">
                    <Badge variant={project.priority === 'High' ? 'destructive' : project.priority === 'Medium' ? 'secondary' : 'outline'}>
                        {project.priority} Priority
                    </Badge>
                    {isManager && (
                      <Button variant="outline" size="icon">
                          <Pen className="h-4 w-4" />
                      </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className={isManager ? "md:col-span-1" : "md:col-span-3"}>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <strong>Deadline:</strong>
                            <p>{new Date(project.deadline).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <strong>Required Skills:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {project.requiredSkills.map(skill => (
                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                         <div className="pt-4">
                            <h3 className="font-semibold flex items-center gap-2 mb-3">
                                <Users className="h-5 w-5" /> Allocated Team
                            </h3>
                             {allocatedResources.length > 0 ? (
                                <div className="space-y-4">
                                    {allocatedResources.map((allocation) => (
                                        allocation.resource && (
                                            <div key={allocation.id} className="flex items-center justify-between p-2 rounded-md">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border">
                                                        <AvatarImage src={allocation.resource.avatar} alt={allocation.resource.name} />
                                                        <AvatarFallback>{allocation.resource.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{allocation.resource.name}</p>
                                                        <p className="text-sm text-muted-foreground">{allocation.resource.role}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No resources allocated yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {isManager && (
                <div className="md:col-span-2">
                    <Tabs defaultValue="suggestions">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
                            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="suggestions">
                            <Card>
                                <CardHeader>
                                     <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="text-primary" /> AI Assignment
                                    </CardTitle>
                                    <CardDescription>
                                        Use AI to find and assign the best resources for this project.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <Button onClick={handleAiAssignClick} disabled={allResources.length === 0}>
                                        <Zap className="mr-2 h-4 w-4" /> AI Assign Resources
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {allResources.length === 0 
                                            ? "Please add a resource before getting suggestions."
                                            : "Click the button to get AI-powered assignment recommendations."
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="logs">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Audit Logs</CardTitle>
                                    <CardDescription>
                                        History of allocations for this project.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     {allocatedResources.length > 0 ? (
                                        <div className="space-y-6">
                                            {allocatedResources.map(({ id, resource, reasoning, match, createdAt }) => (
                                                resource && (
                                                    <div key={id} className="flex items-start gap-4">
                                                        <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                                                        <div className="flex-1">
                                                            <p className="text-sm">
                                                                <span className="font-semibold">{resource.name}</span>
                                                                {' was assigned to this project.'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {createdAt ? `${formatDistanceToNow(createdAt.toDate(), { addSuffix: true })}` : 'Recently'}
                                                            </p>
                                                            <div className="mt-2 p-3 bg-muted/50 rounded-md border text-sm">
                                                                <p className="font-semibold flex items-center gap-2">
                                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    Reasoning (Match: {match}%)
                                                                </p>
                                                                <p className="text-muted-foreground mt-1 italic">
                                                                    "{reasoning}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-4">No allocation history yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                )}
            </div>
            {project && (
                <ProjectAiSuggestions 
                    project={project} 
                    allResources={allResources}
                    open={isSuggestionModalOpen}
                    onOpenChange={setIsSuggestionModalOpen}
                />
            )}
        </div>
    );
}
