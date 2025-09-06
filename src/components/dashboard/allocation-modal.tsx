'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Target, Info, CheckCircle, AlertTriangle, XCircle, Calendar, Clock } from 'lucide-react';
import type { Project, Resource, Allocation } from '@/lib/types';

interface AllocationModalProps {
    project: Project;
    allocations: Allocation[];
    resources: Resource[];
}

const statusInfo = {
  matched: {
    icon: CheckCircle,
    color: "text-green-600",
    text: "Perfect Match",
  },
  partial: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    text: "Partial Match",
  },
  conflict: {
    icon: XCircle,
    color: "text-red-600",
    text: "Allocation Conflict",
  }
}

export function AllocationModal({ project, allocations, resources }: AllocationModalProps) {
  const getResourceById = (id: string) => resources.find((r) => r.id === id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="mr-2 h-4 w-4" /> Why?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Allocation Rationale</DialogTitle>
          <DialogDescription>
            AI-powered reasoning for resource assignments to project: <span className="font-semibold text-foreground">{project.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          {allocations.map(allocation => {
            const resource = getResourceById(allocation.resourceId);
            const status = statusInfo[allocation.status];
            if (!resource) return null;

            return (
              <div key={resource.id} className="space-y-4">
                <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border">
                        <AvatarImage src={resource.avatar} alt={resource.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{resource.name}</h3>
                                <p className="text-sm text-muted-foreground">{resource.role}</p>
                            </div>
                            <Badge variant="outline" className="flex items-center gap-1.5">
                                <Target className="h-4 w-4 text-primary" />
                                <span className="font-mono text-sm">Confidence: {allocation.match}%</span>
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <status.icon className={`h-4 w-4 ${status.color}`} />
                          <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
                        </div>
                    </div>
                </div>
                <div className="ml-16 pl-2 border-l-2 space-y-3 text-sm">
                    <h4 className="font-semibold text-muted-foreground">Reasoning:</h4>
                    <p className="text-muted-foreground italic">"{allocation.reasoning}"</p>
                    <div className="space-y-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Resource has <span className="font-semibold text-foreground">{resource.availability} hours/week</span> available.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Aligns with project deadline of <span className="font-semibold text-foreground">{new Date(project.deadline).toLocaleDateString()}</span>.</span>
                        </div>

                    </div>
                </div>
                <Separator className="my-4" />
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
