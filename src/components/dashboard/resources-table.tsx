'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Resource, Project, Allocation } from '@/lib/types';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { ResourceAiSuggestions } from '../resource/resource-ai-suggestions';
import { useToast } from '@/hooks/use-toast';


interface ResourcesTableProps {
  resources: Resource[];
  projects: Project[];
  allocations: Allocation[];
  loading: boolean;
}

export function ResourcesTable({ resources, projects, allocations, loading }: ResourcesTableProps) {
  const router = useRouter();
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const { toast } = useToast();

  const handleRowClick = (resourceId: string) => {
    router.push(`/resource/${resourceId}`);
  };

  const handleAssignClick = (e: React.MouseEvent, resource: Resource) => {
    e.stopPropagation();
    if (projects.length === 0) {
      toast({
        title: "No Projects Available",
        description: "Please add a project before getting suggestions.",
        variant: "destructive",
      });
      return;
    }
    setSelectedResource(resource);
    setSuggestionModalOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Resource</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Skills</TableHead>
            <TableHead className="w-[150px]">Availability</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                  <TableCell>
                      <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className='space-y-2'>
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32" />
                          </div>
                      </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
              </TableRow>
            ))
          ) : (
          resources.map((resource) => {
            const isAssigned = allocations.some(a => a.resourceId === resource.id);
            return (
              <TableRow 
                key={resource.id} 
                onClick={() => handleRowClick(resource.id)}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={resource.avatar} alt={resource.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{resource.name}</div>
                      <div className="text-sm text-muted-foreground">{resource.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{resource.role}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {resource.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {resource.skills.length > 4 && (
                      <Badge variant="outline">+{resource.skills.length - 4}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={(resource.availability / 40) * 100} className="h-2" />
                    <span className="text-xs text-muted-foreground">{resource.availability}h/wk</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                    <Button 
                      variant={isAssigned ? "secondary" : "outline"} 
                      size="sm"
                      onClick={(e) => handleAssignClick(e, resource)}
                    >
                      {isAssigned ? 'Assigned' : 'Assign'}
                    </Button>
                </TableCell>
              </TableRow>
            )
          })
          )}
        </TableBody>
      </Table>
      {selectedResource && (
          <ResourceAiSuggestions
              resource={selectedResource}
              allProjects={projects}
              open={suggestionModalOpen}
              onOpenChange={setSuggestionModalOpen}
          />
      )}
    </>
  );
}
