
'use client';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Resource } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

type GroupedResources = {
  [key: string]: Resource[];
};

export default function TeamsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qResources = query(collection(db, "resources"));
    const unsubscribeResources = onSnapshot(qResources, (querySnapshot) => {
      const resourcesData: Resource[] = [];
      querySnapshot.forEach((doc) => {
        resourcesData.push({ id: doc.id, ...doc.data() } as Resource);
      });
      setResources(resourcesData);
      setLoading(false);
    });

    return () => {
      unsubscribeResources();
    };
  }, []);

  const groupBy = (key: 'role' | 'seniority' | 'skills') => {
    return resources.reduce((acc, resource) => {
      if (key === 'skills') {
        resource.skills.forEach(skill => {
            if (!acc[skill]) acc[skill] = [];
            acc[skill].push(resource);
        });
      } else {
        const groupKey = resource[key];
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(resource);
      }
      return acc;
    }, {} as GroupedResources);
  };
  
  const byRole = groupBy('role');
  const bySeniority = groupBy('seniority');
  const bySkill = groupBy('skills');

  const renderGroup = (groupedData: GroupedResources) => {
     if (loading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="flex items-center gap-4 p-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
          ))}
        </div>
      )
    }
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(groupedData).map(([groupName, members]) => (
            <Card key={groupName}>
                <CardHeader>
                <CardTitle>{groupName} ({members.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {members.map(member => (
                    <Link href={`/resource/${member.id}`} key={member.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                    <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    </Link>
                ))}
                </CardContent>
            </Card>
            ))}
        </div>
    )
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Teams</h1>
      </div>

      <Tabs defaultValue="role" className="space-y-4">
        <TabsList>
          <TabsTrigger value="role">By Role</TabsTrigger>
          <TabsTrigger value="seniority">By Seniority</TabsTrigger>
          <TabsTrigger value="skill">By Skill</TabsTrigger>
        </TabsList>
        <TabsContent value="role">
            {renderGroup(byRole)}
        </TabsContent>
        <TabsContent value="seniority">
            {renderGroup(bySeniority)}
        </TabsContent>
        <TabsContent value="skill">
            {renderGroup(bySkill)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
