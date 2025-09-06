
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { intelligentProjectMatching, IntelligentProjectMatchingOutput } from '@/ai/flows/intelligent-project-matching';
import type { Project, Resource } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Target, Zap, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

interface ResourceAiSuggestionsProps {
    resource: Resource;
    allProjects: Project[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ResourceAiSuggestions({ resource, allProjects, open, onOpenChange }: ResourceAiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<IntelligentProjectMatchingOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const { toast } = useToast();

     useEffect(() => {
        if (open) {
            handleFetchSuggestions();
        } else {
            setSuggestions(null);
            setSelectedProjects([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleFetchSuggestions = async () => {
        if (allProjects.length === 0) {
            return;
        }

        setIsLoading(true);

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
        } catch (error) {
            console.error("Error fetching AI suggestions:", error);
            toast({
                title: "Error",
                description: "Could not fetch AI project suggestions. Please try again.",
                variant: "destructive"
            });
            setSuggestions(null);
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async (projectIds: string[]) => {
        setIsAssigning(true);
        try {
            const allocationPromises = projectIds.map(projectId => {
                const suggestion = suggestions?.projectAllocations.find(p => p.projectId === projectId);
                const match = suggestion?.matchPercentage ?? 0;
                const reasoning = suggestion?.reasoning ?? 'N/A';
                return addDoc(collection(db, 'allocations'), {
                    projectId,
                    resourceId: resource.id,
                    match,
                    reasoning,
                    status: match > 90 ? 'matched' : match > 60 ? 'partial' : 'conflict',
                });
            });

            await Promise.all(allocationPromises);

            toast({
                title: "Resource Assigned",
                description: `Successfully assigned ${resource.name} to ${projectIds.length} project(s).`,
            });
            onOpenChange(false);
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
        <Dialog open={open} onOpenChange={onOpenChange}>
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
    );
}
