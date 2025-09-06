'use client';
import React from 'react';
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
import { AllocationModal } from './allocation-modal';
import type { Project, Resource, Allocation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

interface ProjectsTableProps {
  projects: Project[];
  resources: Resource[];
  allocations: Allocation[];
  loading: boolean;
}

export function ProjectsTable({ projects, resources, allocations, loading }: ProjectsTableProps) {
  const router = useRouter();
  const getResourceById = (id: string) => resources.find((r) => r.id === id);

  const getStatusColor = (status: Allocation['status']) => {
    switch (status) {
      case 'matched':
        return 'bg-green-500';
      case 'partial':
        return 'bg-yellow-500';
      case 'conflict':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRowClick = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

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
        {loading ? (
          [...Array(5)].map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
            </TableRow>
          ))
        ) : (
        projects.map((project) => (
          <TableRow 
            key={project.id} 
            onClick={() => handleRowClick(project.id)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>
              <Badge
                variant={
                  project.priority === 'High'
                    ? 'destructive'
                    : project.priority === 'Medium'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {project.priority}
              </Badge>
            </TableCell>
            <TableCell>{format(new Date(project.deadline), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <div className="flex -space-x-2">
                {allocations
                  .filter((a) => a.projectId === project.id)
                  .map((a) => getResourceById(a.resourceId))
                  .map((resource) =>
                    resource ? (
                      <Avatar key={resource.id} className="border-2 border-card">
                        <AvatarImage src={resource.avatar} alt={resource.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ) : null
                  )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {allocations
                  .filter((a) => a.projectId === project.id)
                  .map((a) => (
                    <div
                      key={a.resourceId}
                      className={cn('h-3 w-3 rounded-full', getStatusColor(a.status))}
                      title={`${a.status} match`}
                    />
                  ))}
              </div>
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <AllocationModal project={project} allocations={allocations.filter(a => a.projectId === project.id)} resources={resources}/>
            </TableCell>
          </TableRow>
        ))
        )}
      </TableBody>
    </Table>
  );
}
