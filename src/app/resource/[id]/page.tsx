import { resources, projects, allocations } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
    const resource = resources.find(r => r.id === params.id);

    if (!resource) {
        notFound();
    }

    const getProjectById = (id: string) => projects.find(p => p.id === id);

    const resourceAllocations = allocations
        .filter(a => a.resourceId === resource.id)
        .map(a => ({
            ...a,
            project: getProjectById(a.projectId)
        }))
        .filter(a => a.project);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border">
                        <AvatarImage src={resource.avatar} alt={resource.name} />
                        <AvatarFallback>{resource.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">{resource.name}</h1>
                        <p className="text-muted-foreground text-lg">{resource.role}</p>
                        <p className="text-muted-foreground">{resource.email}</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Allocations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {resourceAllocations.length > 0 ? (
                                <div className="space-y-4">
                                    {resourceAllocations.map(({ project, match, status }) => (
                                        project && (
                                            <div key={project.id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">{project.name}</p>
                                                    <p className="text-sm text-muted-foreground">Due: {new Date(project.deadline).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{match}% Match</p>
                                                    <p className={`text-sm ${status === 'matched' ? 'text-green-500' : status === 'partial' ? 'text-yellow-500' : 'text-red-500'}`}>{status}</p>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Not allocated to any projects.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="skills">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Certifications</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                             {resource.skills.map(skill => (
                                <Badge key={skill} variant="secondary" className="text-base py-1 px-3">{skill}</Badge>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="availability">
                    <Card>
                        <CardHeader>
                            <CardTitle>Availability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Progress value={(resource.availability / 40) * 100} className="h-3" />
                                <span className="font-semibold text-lg">{resource.availability}h / 40h</span>
                            </div>
                            <p className="text-muted-foreground">Availability calendar will be implemented here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="recommendations">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Recommendations</CardTitle>
                            <CardDescription>Projects this resource might be a good fit for.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground">AI recommendations will be implemented here.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
