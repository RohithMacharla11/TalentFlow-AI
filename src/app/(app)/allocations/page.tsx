
'use client';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Allocation, Project, Resource } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<(Allocation & {project?: Project, resource?: Resource})[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const qProjects = query(collection(db, 'projects'));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
    });

    const qResources = query(collection(db, 'resources'));
    const unsubscribeResources = onSnapshot(qResources, (snapshot) => {
      const resourcesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
      setResources(resourcesData);
    });
    
    return () => {
      unsubscribeProjects();
      unsubscribeResources();
    };
  }, []);

  useEffect(() => {
    // Wait until projects and resources are loaded
    if(projects.length === 0 && resources.length > 0) return;
    if(resources.length === 0 && projects.length > 0) return;


    const qAllocations = query(collection(db, 'allocations'));
    const unsubscribeAllocations = onSnapshot(qAllocations, (snapshot) => {
      const allocationsData = snapshot.docs.map(doc => {
        const data = doc.data() as Allocation;
        const project = projects.find(p => p.id === data.projectId);
        const resource = resources.find(r => r.id === data.resourceId);
        return { id: doc.id, ...data, project, resource };
      });
      setAllocations(allocationsData);
      setLoading(false);
    });
    
    return () => unsubscribeAllocations();

  }, [projects, resources]);

  const handleRemoveAllocation = async (allocationId: string) => {
    try {
      await deleteDoc(doc(db, "allocations", allocationId));
      toast({
        title: "Allocation Removed",
        description: "The resource has been successfully de-allocated.",
      });
    } catch (error) {
      console.error("Error removing allocation:", error);
      toast({
        title: "Error",
        description: "Failed to remove allocation. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">All Allocations</h1>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Match %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reasoning</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              allocations.map(allocation => (
                <TableRow key={allocation.id}>
                  <TableCell>
                    {allocation.project ? (
                        <Link href={`/project/${allocation.projectId}`} className="font-medium text-primary hover:underline">
                            {allocation.project.name}
                        </Link>
                    ) : (
                        <span className="text-muted-foreground">Unknown Project</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {allocation.resource ? (
                        <Link href={`/resource/${allocation.resourceId}`} className="flex items-center gap-2 hover:underline">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={allocation.resource.avatar} />
                                <AvatarFallback>{allocation.resource.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{allocation.resource.name}</span>
                        </Link>
                     ) : (
                        <span className="text-muted-foreground">Unknown Resource</span>
                    )}
                  </TableCell>
                  <TableCell>{allocation.match}%</TableCell>
                  <TableCell>
                    <Badge variant={allocation.status === 'matched' ? 'default' : allocation.status === 'partial' ? 'secondary' : 'destructive'}>
                        {allocation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-sm truncate">
                    {allocation.reasoning}
                  </TableCell>
                   <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the
                            allocation of {allocation.resource?.name} from {allocation.project?.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveAllocation(allocation.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
