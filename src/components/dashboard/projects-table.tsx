
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useDroppable } from '@dnd-kit/core';
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
import { AllocationModal } from './allocation-modal';
import type { Project, Resource, Allocation, ProjectRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/auth-context';
import { createProjectRequest } from '@/services/firestore-service';
import { useToast } from '@/hooks/use-toast';
import { Send, Eye } from 'lucide-react';

interface ProjectsTableProps {
  projects: Project[];
  resources: Resource[];
  allocations: Allocation[];
  loading: boolean;
  requests?: ProjectRequest[];
  currentUserResource?: Resource | null;
  isMyProjects?: boolean;
}

function ProjectRow({ project, resources, allocations, requests, currentUserResource, isMyProjects }: { project: Project } & Omit<ProjectsTableProps, 'projects' | 'loading'>) {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const isManager = user?.role === 'Administrator' || user?.role === 'Project Manager';

    const { setNodeRef, isOver } = useDroppable({
        id: `project-drop-${project.id}`,
        data: {
            type: 'project',
            project: project,
        },
        disabled: !isManager,
    });

    const getResourceById = (id: string) => resources.find((r) => r.id === id);

    const getStatusColor = (status: Allocation['status']) => {
        switch (status) {
            case 'matched': return 'bg-green-500';
            case 'partial': return 'bg-yellow-500';
            case 'conflict': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const handleRowClick = (projectId: string) => router.push(`/project/${projectId}`);

    const handleRequestJoin = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (!currentUserResource) {
            toast({ title: "Error", description: "Could not identify your resource profile.", variant: "destructive" });
            return;
        }
        try {
            await createProjectRequest({
                projectId: projectId,
                resourceId: currentUserResource.id,
            });
            toast({ title: "Request Sent", description: "Your request to join the project has been sent to the manager." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to send your request.", variant: "destructive" });
        }
    }

    const isRequested = requests?.some(r => r.projectId === project.id && r.resourceId === currentUserResource?.id && r.status === 'pending');
    const projectAllocations = allocations.filter((a) => a.projectId === project.id);

    return (
        <TableRow
            ref={setNodeRef}
            key={project.id}
            onClick={() => handleRowClick(project.id)}
            className={cn("cursor-pointer", { 'bg-primary/10 outline-dashed outline-2 outline-primary': isOver })}
        >
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>
                <Badge variant={project.priority === 'High' ? 'destructive' : project.priority === 'Medium' ? 'secondary' : 'outline'}>
                    {project.priority}
                </Badge>
            </TableCell>
            <TableCell>{format(new Date(project.deadline), 'MMM d, yyyy')}</TableCell>
            <TableCell>
                <div className="flex -space-x-2">
                    {projectAllocations.map((a, index) => getResourceById(a.resourceId)).map((resource, index) =>
                        resource ? (
                            <Avatar key={`${resource.id}-${index}`} className="border-2 border-card">
                                <AvatarImage src={resource.avatar} alt={resource.name} data-ai-hint="person portrait" />
                                <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ) : null
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    {projectAllocations.map((a, index) => (
                        <div key={`${a.id}-${index}`} className={cn('h-3 w-3 rounded-full', getStatusColor(a.status))} title={`${a.status} match`} />
                    ))}
                </div>
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                {user?.role === 'Team Member' ? (
                    isMyProjects ? (
                        <Button variant="outline" size="sm" onClick={() => handleRowClick(project.id)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                        </Button>
                    ) : (
                        <Button variant={isRequested ? "secondary" : "outline"} size="sm" onClick={(e) => handleRequestJoin(e, project.id)} disabled={isRequested}>
                            <Send className="mr-2 h-4 w-4" />
                            {isRequested ? 'Requested' : 'Request to Join'}
                        </Button>
                    )
                ) : (
                    <AllocationModal project={project} allocations={projectAllocations} resources={resources} />
                )}
            </TableCell>
        </TableRow>
    );
}

export function ProjectsTable(props: ProjectsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Project</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Allocated Resources</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.loading ? (
          [...Array(5)].map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-24" /></TableCell>
            </TableRow>
          ))
        ) : (
          props.projects.map((project) => <ProjectRow key={project.id} project={project} {...props} />)
        )}
      </TableBody>
    </Table>
  );
}
