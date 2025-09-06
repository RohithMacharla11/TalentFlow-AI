'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { intelligentProjectMatching, IntelligentProjectMatchingOutput } from '@/ai/flows/intelligent-project-matching';
import type { Project, Resource } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Target, Check, Zap, Briefcase, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface ResourceAiSuggestionsProps {
    resource: Resource;
    allProjects: Project[];
}

export function ResourceAiSuggestions({ resource, allProjects }: ResourceAiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<IntelligentProjectMatchingOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const { toast } = useToast();

    const handleFetchSuggestions = async () => {
        if (allProjects.length === 0) {
            toast({
                title: "No Projects Available",
                description: "There are no projects in the system to assign this resource to. Please add a project first.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setOpen(true);

        try {
            const result = await intelligentProjectMatching({
                resourceProfile: {
                    id: resource.id,
                    name: resource.name,
                    skills: resource.skills,
                    availability: resource.availability,
                },
                projectProfiles: allProjects.map(p => ({
                    id: p.id,
                    name: p.name,
                    requiredSkills: p.requiredSkills,
                    deadline: p.deadline,
                    priority: p.priority,
                })),
            });
            setSuggestions(result);
            setSelectedProjects([]);
        } catch (error) {
            console.error("Error fetching AI suggestions:", error);
            toast({
                title: "Error",
                description: "Could not fetch AI project suggestions. Please try again.",
                variant: "destructive"
            });
            setSuggestions(null);
            setOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async (projectIds: string[]) => {
        setIsAssigning(true);
        try {
            const allocationPromises = projectIds.map(projectId => {
                const match = suggestions?.projectAllocations.find(p => p.projectId === projectId)?.matchPercentage ?? 0;
                return addDoc(collection(db, 'allocations'), {
                    projectId,
                    resourceId: resource.id,
                    match,
                    status: match > 90 ? 'matched' : match > 60 ? 'partial' : 'conflict',
                });
            });

            await Promise.all(allocationPromises);

            toast({
                title: "Resource Assigned",
                description: `Successfully assigned ${resource.name} to ${projectIds.length} project(s).`,
            });
            setOpen(false);
        } catch (error) {
            console.error("Error assigning resource: ", error);
            toast({
                title: "Error",
                description: "Failed to assign resource. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAssigning(false);
        }
    };
    
    const handleAutoAssign = () => {
        if(suggestions && suggestions.projectAllocations.length > 0) {
            const bestFitId = suggestions.projectAllocations[0].projectId;
            handleAssign([bestFitId]);
        }
    }

    const handleManualAssign = () => {
        if (selectedProjects.length > 0) {
            handleAssign(selectedProjects);
        } else {
            toast({
                title: "No Selection",
                description: "Please select at least one project to assign.",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" /> AI Project Suggestions
                </CardTitle>
                <CardDescription>Use AI to find the most suitable projects for {resource.name}.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                 <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleFetchSuggestions} disabled={isLoading}>
                             <Zap className="mr-2 h-4 w-4" /> {isLoading ? 'Analyzing...' : 'AI Suggest Projects'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>AI Project Recommendations</DialogTitle>
                            <DialogDescription>
                                Top project matches for {resource.name}, ranked by best fit. Select projects to assign.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
                             {isLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4">
                                            <Skeleton className="h-8 w-full rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            ) : suggestions && suggestions.projectAllocations.length > 0 ? (
                                <div className="space-y-4">
                                    {suggestions.projectAllocations.map((rec) => (
                                        <div key={rec.projectId} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                            <Checkbox 
                                                id={`proj-${rec.projectId}`} 
                                                checked={selectedProjects.includes(rec.projectId)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedProjects(prev => checked ? [...prev, rec.projectId] : prev.filter(id => id !== rec.projectId))
                                                }}
                                            />
                                            <Label htmlFor={`proj-${rec.projectId}`} className="flex flex-1 items-start gap-4 cursor-pointer">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{rec.projectName}</h4>
                                                    <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                                                </div>
                                                <Badge variant="outline" className="flex items-center gap-1.5">
                                                    <Target className="h-3 w-3 text-primary" />
                                                    <span className="font-mono text-xs">{rec.matchPercentage}% Match</span>
                                                </Badge>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <div className="text-center py-10">
                                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-medium text-muted-foreground">No Suggestions</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Could not find any suitable projects for {resource.name}.</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={handleAutoAssign} disabled={isAssigning || isLoading || !suggestions?.projectAllocations.length}>
                                <Zap className="mr-2 h-4 w-4"/> Auto-Assign Best Fit
                            </Button>
                            <Button onClick={handleManualAssign} disabled={isAssigning || isLoading || selectedProjects.length === 0}>
                                {isAssigning ? 'Assigning...' : `Assign to Selected (${selectedProjects.length})`}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <p className="text-xs text-muted-foreground mt-2">Click the button to get AI-powered project recommendations.</p>
            </CardContent>
        </Card>
    );
}