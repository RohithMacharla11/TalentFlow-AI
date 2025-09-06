
'use client';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ProjectRequest, Project, Resource } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { AlertCircle, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { allocateResource, getProjectById, getResourceByEmail, updateProjectRequestStatus } from '@/services/firestore-service';
import { intelligentResourceMatching } from '@/ai/flows/intelligent-resource-matching';
import Link from 'next/link';

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<(ProjectRequest & { project?: Project, resource?: Resource })[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const qRequests = query(collection(db, 'requests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(qRequests, async (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectRequest));
      
      const populatedRequests = await Promise.all(requestsData.map(async (req) => {
        const projectDoc = await getDoc(doc(db, 'projects', req.projectId));
        const resourceDoc = await getDoc(doc(db, 'resources', req.resourceId));
        return {
          ...req,
          project: projectDoc.exists() ? { id: projectDoc.id, ...projectDoc.data() } as Project : undefined,
          resource: resourceDoc.exists() ? { id: resourceDoc.id, ...resourceDoc.data() } as Resource : undefined,
        }
      }));

      setRequests(populatedRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: ProjectRequest & { project?: Project, resource?: Resource }) => {
    if (!request.project || !request.resource) {
        toast({ title: "Error", description: "Missing project or resource data.", variant: "destructive" });
        return;
    }
    
    try {
        // Run AI matching to get reasoning
        const matchingResult = await intelligentResourceMatching({
            projectDescription: `${request.project.name}: ${request.project.description}`,
            resourceProfiles: [{
                id: request.resource.id,
                name: request.resource.name,
                skills: request.resource.skills,
                availability: request.resource.availability
            }],
            priorityFactors: `Approving a direct request from the resource. Focus on skill fit.`
        });
        
        const allocationDetails = matchingResult.resourceAllocations[0];

        // Create allocation
        await allocateResource({
            projectId: request.projectId,
            resourceId: request.resourceId,
            match: allocationDetails.matchPercentage,
            reasoning: `Approved by manager after user request. AI Reason: "${allocationDetails.reasoning}"`,
            status: allocationDetails.matchPercentage > 85 ? 'matched' : 'partial'
        });

        // Update request status
        await updateProjectRequestStatus(request.id, 'approved');

        toast({ title: "Request Approved", description: `${request.resource.name} has been allocated to ${request.project.name}.`});

    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to approve the request.", variant: "destructive"});
    }
  };

  const handleReject = async (requestId: string) => {
     try {
        await updateProjectRequestStatus(requestId, 'rejected');
        toast({ title: "Request Rejected", description: "The request has been rejected."});
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to reject the request.", variant: "destructive"});
    }
  };

  if (user?.role === 'Team Member') {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    You do not have permission to view this page.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Pending Requests</h1>
         <p className="text-muted-foreground">Approve or reject requests from team members to join projects.</p>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Skeleton className="h-8 w-8 inline-block" />
                    <Skeleton className="h-8 w-8 inline-block" />
                    </TableCell>
                </TableRow>
              ))
            ) : requests.length > 0 ? (
              requests.map(request => (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.resource ? (
                        <Link href={`/resource/${request.resource.id}`} className="flex items-center gap-3 hover:underline">
                            <Avatar>
                                <AvatarImage src={request.resource.avatar} />
                                <AvatarFallback>{request.resource.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{request.resource.name}</p>
                                <p className="text-sm text-muted-foreground">{request.resource.role}</p>
                            </div>
                        </Link>
                    ): 'Unknown Resource'}
                  </TableCell>
                  <TableCell>
                    {request.project ? (
                        <Link href={`/project/${request.project.id}`} className="font-medium hover:underline">
                            {request.project.name}
                        </Link>
                    ): 'Unknown Project'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(request.requestedAt.toDate(), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleApprove(request)}>
                        <Check className="h-5 w-5 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleReject(request.id)}>
                        <X className="h-5 w-5 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No pending requests.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
