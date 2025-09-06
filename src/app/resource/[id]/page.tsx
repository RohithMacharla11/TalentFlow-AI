
'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Resource, Project, Allocation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { notFound } from "next/navigation";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Pen, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { ResourceAiSuggestions } from '@/components/resource/resource-ai-suggestions';
import { useToast } from '@/hooks/use-toast';

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
    const [resource, setResource] = useState<Resource | null>(null);
    const [resourceAllocations, setResourceAllocations] = useState<(Allocation & { project?: Project })[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchResource = async () => {
            const resourceDoc = await getDoc(doc(db, "resources", params.id));
            if (resourceDoc.exists()) {
                setResource({ id: resourceDoc.id, ...resourceDoc.data() } as Resource);
            } else {
                notFound();
            }
            setLoading(false);
        };
        fetchResource();
        
        const qProjects = query(collection(db, "projects"));
        const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setAllProjects(projectsData);
        });

        return () => {
            unsubscribeProjects();
        };

    }, [params.id]);

    useEffect(() => {
        if (!resource) return;

        const qAllocations = query(collection(db, "allocations"), where("resourceId", "==", resource.id));
        const unsubscribeAllocations = onSnapshot(qAllocations, (snapshot) => {
            const allocationsData = snapshot.docs.map(doc => doc.data() as Allocation);
            const populatedAllocations = allocationsData.map(alloc => {
                const project = allProjects.find(p => p.id === alloc.projectId);
                return { ...alloc, project };
            });
            setResourceAllocations(populatedAllocations);
        });

        return () => {
            unsubscribeAllocations();
        };

    }, [resource, allProjects]);

    const handleAiSuggestClick = () => {
        if (allProjects.length === 0) {
            toast({
                title: "No Projects Available",
                description: "Please add a project before getting suggestions.",
                variant: "destructive",
            });
            return;
        }
        setIsSuggestionModalOpen(true);
    };


    if (loading) {
        return <p>Loading...</p>;
    }

    if (!resource) {
        return notFound();
    }

    const totalAvailability = 40;
    const allocatedHours = resourceAllocations.reduce((acc, curr) => acc + (curr.project ? 8 : 0), 0); // Simplified: 8h per project
    const remainingAvailability = Math.max(0, resource.availability - allocatedHours);


    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border">
                        <AvatarImage src={resource.avatar} alt={resource.name} />
                        <AvatarFallback>{resource.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">{resource.name}</h1>
                        <p className="text-muted-foreground text-lg">{resource.role}</p>
                        <p className="text-muted-foreground">{resource.email}</p>
                    </div>
                </div>
                 <Button variant="outline" size="icon">
                    <Pen className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Allocations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {resourceAllocations.length > 0 ? (
                                <div className="space-y-4">
                                    {resourceAllocations.map(({ project, match, status }) => (
                                        project && (
                                            <Link href={`/project/${project.id}`} key={project.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                                <div>
                                                    <p className="font-semibold">{project.name}</p>
                                                    <p className="text-sm text-muted-foreground">Due: {new Date(project.deadline).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    {match && <p className="font-semibold">{match}% Match</p>}
                                                    {status && <p className={`text-sm font-semibold capitalize ${status === 'matched' ? 'text-green-500' : status === 'partial' ? 'text-yellow-500' : 'text-red-500'}`}>{status}</p>}
                                                </div>
                                            </Link>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Not allocated to any projects. Find suitable projects in the "AI Recommendations" tab.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="skills">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Certifications</CardTitle>
                        </Header>
                        <CardContent className="flex flex-wrap gap-2">
                             {resource.skills.map(skill => (
                                <Badge key={skill} variant="secondary" className="text-base py-1 px-3">{skill}</Badge>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="availability">
                    <Card>
                        <CardHeader>
                            <CardTitle>Availability</CardTitle>
                            <CardDescription>Resource's weekly capacity and current commitment.</CardDescription>
                        </Header>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between font-mono text-sm">
                                    <span>{allocatedHours}h Allocated</span>
                                    <span>{remainingAvailability}h Free</span>
                                </div>
                                <Progress value={(allocatedHours / totalAvailability) * 100} className="h-3" />
                                <div className="text-xs text-muted-foreground text-center">
                                    {resource.availability}h / {totalAvailability}h Total Capacity
                                </div>
                            </div>
                            <p className="text-muted-foreground pt-4">A more detailed availability calendar will be implemented here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="recommendations">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-primary" /> AI Project Suggestions
                            </CardTitle>
                            <CardDescription>Use AI to find the most suitable projects for {resource.name}.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Button onClick={handleAiSuggestClick} disabled={allProjects.length === 0}>
                                <Zap className="mr-2 h-4 w-4" /> AI Suggest Projects
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                {allProjects.length === 0
                                    ? "Please add a project before getting suggestions."
                                    : "Click the button to get AI-powered project recommendations."
                                }
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             {resource && (
                <ResourceAiSuggestions
                    resource={resource}
                    allProjects={allProjects}
                    open={isSuggestionModalOpen}
                    onOpenChange={setIsSuggestionModalOpen}
                />
            )}
        </div>
    );
}
