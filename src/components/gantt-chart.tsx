
'use client';
import React, { useMemo } from 'react';
import { Project } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { startOfDay, differenceInDays } from 'date-fns';
import { Card, CardContent } from './ui/card';

interface GanttChartProps {
    projects: Project[];
}

interface GanttData {
    name: string;
    range: [number, number];
    duration: number;
}

export function GanttChart({ projects }: GanttChartProps) {
    const { data, overallMinDate } = useMemo(() => {
        if (projects.length === 0) {
            return { data: [], overallMinDate: new Date() };
        }
        
        const overallMinDate = projects.reduce((min, p) => {
            const startDate = new Date(p.startDate);
            return startDate < min ? startDate : min;
        }, new Date(projects[0].startDate));

        const ganttData: GanttData[] = projects.map(p => {
            const start = startOfDay(new Date(p.startDate));
            const end = startOfDay(new Date(p.deadline));
            const startOffset = differenceInDays(start, startOfDay(overallMinDate));
            const duration = differenceInDays(end, start) + 1;
            return {
                name: p.name,
                range: [startOffset, startOffset + duration],
                duration: duration
            };
        }).sort((a,b) => a.range[0] - b.range[0]);

        return { data: ganttData, overallMinDate: startOfDay(overallMinDate) };
    }, [projects]);


    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const startDate = new Date(overallMinDate);
            startDate.setDate(startDate.getDate() + data.range[0]);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + data.duration - 1);

            return (
                <div className="bg-background p-2 border rounded-md shadow-lg text-sm">
                    <p className="font-bold">{label}</p>
                    <p>Start: {startDate.toLocaleDateString()}</p>
                    <p>End: {endDate.toLocaleDateString()}</p>
                    <p>Duration: {data.duration} days</p>
                </div>
            );
        }
        return null;
    };


    if (projects.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 border-dashed border-2 rounded-md">
                <p className="text-muted-foreground">No projects to display in Gantt chart.</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={200 + projects.length * 40}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barCategoryGap="35%"
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={['dataMin', 'dataMax + 2']} unit=" days" />
                <YAxis dataKey="name" type="category" width={150} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted))'}}/>
                <Legend />
                <Bar dataKey="range" name="Project Duration" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
