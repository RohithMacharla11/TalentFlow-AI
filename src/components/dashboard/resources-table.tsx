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
import { Progress } from '@/components/ui/progress';
import type { Resource } from '@/lib/types';
import { Button } from '../ui/button';

interface ResourcesTableProps {
  resources: Resource[];
}

export function ResourcesTable({ resources }: ResourcesTableProps) {
  const router = useRouter();

  const handleRowClick = (resourceId: string) => {
    router.push(`/resource/${resourceId}`);
  };

  return (
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
        {resources.map((resource) => (
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
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="sm">Assign</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
