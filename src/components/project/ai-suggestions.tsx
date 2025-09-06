'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { intelligentResourceMatching, IntelligentResourceMatchingOutput } from '@/ai/flows/intelligent-resource-matching';
import type { Project, Resource } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Target, Check, Zap } from 'lucide-react';

interface AiSuggestionsProps {
    project: Project;
    allResources: Resource[];
}

export function AiSuggestions({ project, allResources }: AiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<IntelligentResourceMatchingOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
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
            } catch (error) {
                console.error("Error fetching AI suggestions:", error);
                setSuggestions(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [project, allResources]);

    const getResourceById = (id: string) => allResources.find(r => r.id === id);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="text-primary" /> AI-Powered Recommendations
                </CardTitle>
                <CardDescription>Top 3 candidates for this project based on skills, availability, and priority.</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <div className="space-y-6">
                        {suggestions.resourceAllocations.map((rec) => {
                            const resource = getResourceById(rec.resourceId);
                            if (!resource) return null;
                            return (
                                <div key={rec.resourceId} className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-14 w-14 border">
                                            <AvatarImage src={resource.avatar} alt={resource.name} />
                                            <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-lg">{resource.name}</h4>
                                            <p className="text-sm text-muted-foreground">{resource.role}</p>
                                            <Badge variant="outline" className="mt-2 flex items-center gap-1.5 w-fit">
                                                <Target className="h-3 w-3 text-primary" />
                                                <span className="font-mono text-xs">{rec.matchPercentage}% Match</span>
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                         <Button size="sm">
                                            <Check className="mr-2 h-4 w-4"/>
                                            Assign
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                         <div className="flex justify-end pt-4">
                            <Button variant="secondary">
                                <Zap className="mr-2 h-4 w-4" />
                                Auto-Assign Best Team
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No AI suggestions available at this time.</p>
                )}
            </CardContent>
        </Card>
    );
}
