
'use client';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Allocation, Project, Resource } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { differenceInDays, format, parseISO } from 'date-fns';

export default function GanttPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

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

    const qAllocations = query(collection(db, 'allocations'));
    const unsubscribeAllocations = onSnapshot(qAllocations, (snapshot) => {
      const allocationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Allocation));
      setAllocations(allocationsData);
      setLoading(false);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeResources();
      unsubscribeAllocations();
    };
  }, []);

  const getResourceName = (resourceId: string) => {
    return resources.find(r => r.id === resourceId)?.name ?? 'Unknown';
  };
  
  const chartData = projects.map(project => {
    const projectAllocations = allocations.filter(a => a.projectId === project.id);
    const start = parseISO(project.startDate);
    const end = parseISO(project.deadline);
    const duration = differenceInDays(end, start);
    
    return {
      name: project.name,
      range: [start.getTime(), end.getTime()],
      duration: duration > 0 ? duration : 1,
      allocations: projectAllocations,
    };
  }).sort((a,b) => a.range[0] - b.range[0]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const startDate = format(new Date(data.range[0]), 'MMM d');
      const endDate = format(new Date(data.range[1]), 'MMM d');
      return (
        <div className="bg-background border p-2 rounded-md shadow-md text-sm">
          <p className="font-bold">{label}</p>
          <p className="text-muted-foreground">{`${startDate} - ${endDate}`}</p>
          <p className="mt-2 font-semibold">Allocated:</p>
          <ul className="list-disc list-inside text-muted-foreground">
            {data.allocations.map((alloc: Allocation) => (
              <li key={alloc.resourceId}>{getResourceName(alloc.resourceId)}</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gantt Chart</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Project Timelines</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px] w-full">
            {loading ? (
                <p>Loading...</p>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{
                        top: 20, right: 30, left: 100, bottom: 5,
                    }}
                    barCategoryGap="30%"
                >
                    <XAxis type="number" domain={['dataMin', 'dataMax']} hide />
                    <YAxis dataKey="name" type="category" width={150} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(120, 120, 120, 0.1)'}}/>
                    <Legend />
                    <Bar
                        dataKey="range"
                        name="Project Duration"
                        fill="hsl(var(--primary) / 0.5)"
                        background={{ fill: 'hsl(var(--muted))' }}
                    />
                </BarChart>
            </ResponsiveContainer>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
