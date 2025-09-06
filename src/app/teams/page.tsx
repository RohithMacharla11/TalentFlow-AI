'use client';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Resource } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Team {
  name: string;
  members: Resource[];
}

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

  const teams: Team[] = [
    { name: "AI Engineers", members: resources.filter(r => r.role.toLowerCase().includes('ai') || r.role.toLowerCase().includes('engineer')) },
    { name: "Full-Stack Developers", members: resources.filter(r => r.role.toLowerCase().includes('full-stack') || r-role.toLowerCase().includes('developer')) },
    { name: "Project Managers", members: resources.filter(r => r.role.toLowerCase().includes('manager')) },
    { name: "Interns", members: resources.filter(r => r.seniority === 'Intern') }
  ].filter(team => team.members.length > 0);


  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Teams</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map(team => (
          <Card key={team.name}>
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {team.members.map(member => (
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
    </div>
  );
}
