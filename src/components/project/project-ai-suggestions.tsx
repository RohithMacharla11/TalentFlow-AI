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
import { intelligentResourceMatching, IntelligentResourceMatchingOutput } from '@/ai/flows/intelligent-resource-matching';
import type { Project, Resource } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Target, Check, Zap, Users, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface ProjectAiSuggestionsProps {
    project: Project;
    allResources: Resource[];
}

export function ProjectAiSuggestions({ project, allResources }: ProjectAiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<IntelligentResourceMatchingOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedResources, setSelectedResources] = useState<string[]>([]);
    const { toast } = useToast();

    const handleFetchSuggestions = async () => {
        if (allResources.length === 0) {
            toast({
                title: "No Resources Available",
                description: "There are no resources in the system to assign. Please add resources first.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setOpen(true);
        const availableResources = allResources.map(r => ({
            id: r.id,
            name: r.name,
            skills: r.skills,
            availability: r.availability,
        }));

        try {
            const result = await intelligentResourceMatching({
                projectDescription: `${project.name}: ${project.description}. Required skills: ${project.requiredSkills.join(', ')}`,
                resourceProfiles: availableResources,
                priorityFactors: `Project priority is ${project.priority}. Focus on skill match and availability.`
            });
            setSuggestions(result);
            setSelectedResources([]);
        } catch (error) {
            console.error("Error fetching AI suggestions:", error);
            toast({
                title: "Error",
                description: "Could not fetch AI suggestions. Please try again.",
                variant: "destructive"
            });
            setSuggestions(null);
            setOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async (resourceIds: string[]) => {
        setIsAssigning(true);
        try {
            const allocationPromises = resourceIds.map(resourceId => {
                const match = suggestions?.resourceAllocations.find(r => r.resourceId === resourceId)?.matchPercentage ?? 0;
                return addDoc(collection(db, 'allocations'), {
                    projectId: project.id,
                    resourceId,
                    match,
                    status: match > 90 ? 'matched' : match > 60 ? 'partial' : 'conflict',
                });
            });

            await Promise.all(allocationPromises);

            toast({
                title: "Resources Assigned",
                description: `Successfully assigned ${resourceIds.length} resource(s) to ${project.name}.`,
            });
            setOpen(false);
        } catch (error) {
            console.error("Error assigning resources: ", error);
            toast({
                title: "Error",
                description: "Failed to assign resources. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAssigning(false);
        }
    };
    
    const handleAutoAssign = () => {
        if(suggestions && suggestions.resourceAllocations.length > 0) {
            const bestFitId = suggestions.resourceAllocations[0].resourceId;
            handleAssign([bestFitId]);
        }
    }

    const handleManualAssign = () => {
        if (selectedResources.length > 0) {
            handleAssign(selectedResources);
        } else {
            toast({
                title: "No Selection",
                description: "Please select at least one resource to assign.",
                variant: "destructive"
            })
        }
    }

    const getResourceById = (id: string) => allResources.find(r => r.id === id);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" /> AI Assignment
                </CardTitle>
                <CardDescription>Use AI to find and assign the best resources for this project.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                 <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleFetchSuggestions} disabled={isLoading}>
                             <Zap className="mr-2 h-4 w-4" /> {isLoading ? 'Analyzing...' : 'AI Assign Resources'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>AI Resource Recommendations</DialogTitle>
                            <DialogDescription>
                                Top candidates for '{project.name}', ranked by best fit. Select resources to assign.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
                             {isLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[200px]" />
                                                <Skeleton className="h-4 w-[250px]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : suggestions && suggestions.resourceAllocations.length > 0 ? (
                                <div className="space-y-4">
                                    {suggestions.resourceAllocations.map((rec) => {
                                        const resource = getResourceById(rec.resourceId);
                                        if (!resource) return null;
                                        return (
                                            <div key={rec.resourceId} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                                                <Checkbox 
                                                    id={`res-${rec.resourceId}`} 
                                                    checked={selectedResources.includes(rec.resourceId)}
                                                    onCheckedChange={(checked) => {
                                                        setSelectedResources(prev => checked ? [...prev, rec.resourceId] : prev.filter(id => id !== rec.resourceId))
                                                    }}
                                                />
                                                <Label htmlFor={`res-${rec.resourceId}`} className="flex flex-1 items-start gap-4 cursor-pointer">
                                                    <Avatar className="h-12 w-12 border">
                                                        <AvatarImage src={resource.avatar} alt={resource.name} />
                                                        <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{resource.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                                                    </div>
                                                    <Badge variant="outline" className="flex items-center gap-1.5">
                                                        <Target className="h-3 w-3 text-primary" />
                                                        <span className="font-mono text-xs">{rec.matchPercentage}% Match</span>
                                                    </Badge>
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                             ) : (
                                <div className="text-center py-10">
                                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-medium text-muted-foreground">No Suggestions</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Could not find any suitable resources.</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={handleAutoAssign} disabled={isAssigning || isLoading || !suggestions?.resourceAllocations.length}>
                                <Zap className="mr-2 h-4 w-4"/> Auto-Assign Best Fit
                            </Button>
                            <Button onClick={handleManualAssign} disabled={isAssigning || isLoading || selectedResources.length === 0}>
                                {isAssigning ? 'Assigning...' : `Assign Selected (${selectedResources.length})`}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <p className="text-xs text-muted-foreground mt-2">Click the button to get AI-powered assignment recommendations.</p>
            </CardContent>
        </Card>
    );
}
