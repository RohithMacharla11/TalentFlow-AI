'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectsTable } from './projects-table';
import { ResourcesTable } from './resources-table';
import type { Project, Resource, Allocation } from '@/lib/types';
import { Briefcase, Users, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardClientProps {
  data: {
    projects: Project[];
    resources: Resource[];
    allocations: Allocation[];
  };
}

export function DashboardClient({ data }: DashboardClientProps) {
  const { projects, resources, allocations } = data;

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your projects and resources with intelligent insights.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
          </Button>
          <Button variant="secondary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-headline text-2xl font-bold">Projects</CardTitle>
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ProjectsTable projects={projects} resources={resources} allocations={allocations} />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-headline text-2xl font-bold">Available Resources</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResourcesTable resources={resources} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
