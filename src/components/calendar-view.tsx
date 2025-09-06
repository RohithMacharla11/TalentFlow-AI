'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Project, Resource, Allocation } from '@/lib/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
    projects: Project[];
    resources: Resource[];
    allocations: Allocation[];
}

export function CalendarView({ projects, resources, allocations }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    const firstDayOfGrid = startOfWeek(firstDayOfMonth);
    const lastDayOfGrid = endOfWeek(lastDayOfMonth);

    const days = eachDayOfInterval({
        start: firstDayOfGrid,
        end: lastDayOfGrid,
    });

    const getResourceById = (id: string) => resources.find(r => r.id === id);

    const allocationsByDay = (day: Date) => {
        return allocations.filter(allocation => {
            const project = projects.find(p => p.id === allocation.projectId);
            if (!project) return false;
            const projectDeadline = new Date(project.deadline);
            return isSameDay(projectDeadline, day);
        });
    }

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-2xl">
                    {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="space-x-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-px border-t border-l">
                    {weekdays.map(day => (
                        <div key={day} className="py-2 text-center font-semibold text-sm text-muted-foreground border-b border-r bg-muted/50">{day}</div>
                    ))}
                    {days.map((day, dayIdx) => {
                        const dailyAllocations = allocationsByDay(day);
                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    'relative min-h-[120px] p-2 border-b border-r',
                                    format(day, 'M') !== format(firstDayOfMonth, 'M') && 'bg-muted/30 text-muted-foreground'
                                )}
                            >
                                <time dateTime={format(day, 'yyyy-MM-dd')} className="font-medium">
                                    {format(day, 'd')}
                                </time>
                                <div className="mt-1 space-y-1">
                                    {dailyAllocations.map(alloc => {
                                        const resource = getResourceById(alloc.resourceId);
                                        const project = projects.find(p => p.id === alloc.projectId);
                                        return (
                                            <div key={`${alloc.projectId}-${alloc.resourceId}`} className="bg-primary/10 text-primary-foreground p-1 rounded-md text-xs">
                                                <p className="font-semibold text-primary">{resource?.name}</p>
                                                <p className="text-primary/80 truncate">{project?.name}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
