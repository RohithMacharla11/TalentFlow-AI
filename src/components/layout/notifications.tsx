'use client';
import { Bell, CheckCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import type { Allocation, Project, Resource } from "@/lib/types";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";


export function Notifications() {
    const [notifications, setNotifications] = useState<(Allocation & { project?: Project, resource?: Resource })[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const qProjects = query(collection(db, 'projects'));
        const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        });

        const qResources = query(collection(db, 'resources'));
        const unsubscribeResources = onSnapshot(qResources, (snapshot) => {
            setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
        });
        
        return () => {
            unsubscribeProjects();
            unsubscribeResources();
        };
    }, []);

     useEffect(() => {
        if (projects.length === 0 || resources.length === 0) return;

        const qAllocations = query(collection(db, 'allocations'), orderBy('createdAt', 'desc'), limit(5));
        const unsubscribeAllocations = onSnapshot(qAllocations, (snapshot) => {
            const allocationsData = snapshot.docs.map(doc => {
                const data = doc.data() as Allocation;
                const project = projects.find(p => p.id === data.projectId);
                const resource = resources.find(r => r.id === data.resourceId);
                return { id: doc.id, ...data, project, resource };
            });
            setNotifications(allocationsData);
            setLoading(false);
        });
        
        return () => unsubscribeAllocations();

    }, [projects, resources]);


    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                            Recent allocation updates.
                        </p>
                    </div>
                    <div className="grid gap-2">
                         {loading ? (
                             <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                         ) : notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                                >
                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium">
                                          <Link href={`/resource/${notification.resourceId}`} className="font-bold hover:underline">{notification.resource?.name}</Link>
                                          {' was assigned to '} 
                                          <Link href={`/project/${notification.projectId}`} className="font-bold hover:underline">{notification.project?.name}</Link>.
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {notification.createdAt ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="text-center text-sm text-muted-foreground py-4">
                                No new notifications.
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
