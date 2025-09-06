
'use client';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, Resource, Allocation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GanttChart } from '@/components/gantt-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function InsightsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let projectCount = 0;
    let resourceCount = 0;
    let allocationCount = 0;

    const checkLoading = () => {
        if (projectCount > 0 && resourceCount > 0 && allocationCount >= 0) { // Allocations can be 0
            setLoading(false);
        }
    }

    const qProjects = query(collection(db, "projects"));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      projectCount = snapshot.size;
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      checkLoading();
    });

    const qResources = query(collection(db, "resources"));
    const unsubscribeResources = onSnapshot(qResources, (snapshot) => {
      resourceCount = snapshot.size;
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
      checkLoading();
    });

    const qAllocations = query(collection(db, "allocations"));
    const unsubscribeAllocations = onSnapshot(qAllocations, (snapshot) => {
      allocationCount = snapshot.size;
      setAllocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Allocation)));
      checkLoading();
    });
    
    return () => {
      unsubscribeProjects();
      unsubscribeResources();
      unsubscribeAllocations();
    };
  }, []);


  const resourceUtilizationData = resources.map(resource => {
    const allocatedHours = allocations
        .filter(a => a.resourceId === resource.id)
        .reduce((acc) => acc + 8, 0); // Simplified: 8h per project
    return {
        name: resource.name,
        capacity: resource.availability,
        allocated: allocatedHours
    };
  });

  const projectPriorityData = [
    { name: 'High', value: projects.filter(p => p.priority === 'High').length },
    { name: 'Medium', value: projects.filter(p => p.priority === 'Medium').length },
    { name: 'Low', value: projects.filter(p => p.priority === 'Low').length },
  ].filter(p => p.value > 0);

  const skillsDemand = projects.flatMap(p => p.requiredSkills).reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const skillsSupply = resources.flatMap(r => r.skills).reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allSkills = [...new Set([...Object.keys(skillsDemand), ...Object.keys(skillsSupply)])];

  const skillsChartData = allSkills.map(skill => ({
      skill,
      demand: skillsDemand[skill] || 0,
      supply: skillsSupply[skill] || 0,
  }));

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
        <h1 className="text-3xl font-bold tracking-tight font-headline">Graphs & Insights</h1>
      </div>
      <Tabs defaultValue="graphs">
        <TabsList>
            <TabsTrigger value="graphs">Dashboard</TabsTrigger>
            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="graphs" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Allocated hours vs. weekly capacity.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-[300px] w-full" /> :
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={resourceUtilizationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="capacity" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="allocated" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                }
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Projects by Priority</CardTitle>
                <CardDescription>Distribution of active projects.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-[300px] w-full" /> :
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                        <Pie data={projectPriorityData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={(entry) => `${entry.name} (${entry.value})`}>
                            {projectPriorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                }
            </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>Skills: Demand vs. Supply</CardTitle>
                <CardDescription>Required skills for projects vs. available skills in resources.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-[300px] w-full" /> :
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={skillsChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="skill" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="demand" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="supply" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                }
            </CardContent>
            </Card>
        </div>
        </TabsContent>
        <TabsContent value="gantt">
            <Card>
                <CardHeader>
                    <CardTitle>Project Timelines</CardTitle>
                    <CardDescription>A Gantt chart view of all active projects and their durations.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-[400px] w-full" /> : <GanttChart projects={projects} />}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
