import { projects, resources, allocations } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { AiSuggestions } from "@/components/project/ai-suggestions";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    const project = projects.find(p => p.id === params.id);

    if (!project) {
        notFound();
    }

    const getResourceById = (id: string) => resources.find(r => r.id === id);

    const allocatedResources = allocations
        .filter(a => a.projectId === project.id)
        .map(a => ({
            ...a,
            resource: getResourceById(a.resourceId)
        }))
        .filter(a => a.resource);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">{project.name}</h1>
                    <p className="text-muted-foreground">{project.description}</p>
                </div>
                <Badge variant={project.priority === 'High' ? 'destructive' : project.priority === 'Medium' ? 'secondary' : 'outline'}>
                    {project.priority} Priority
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
                        <div>
                            <strong>Required Skills:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {project.requiredSkills.map(skill => (
                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="md:col-span-2">
                     <Tabs defaultValue="allocated">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="allocated">Allocated Resources</TabsTrigger>
                            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
                            <TabsTrigger value="logs">Logs</TabsTrigger>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="allocated">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Allocated Resources</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {allocatedResources.length > 0 ? (
                                        <div className="space-y-4">
                                            {allocatedResources.map(({ resource, match, status }) => (
                                                resource && (
                                                    <div key={resource.id} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={resource.avatar} alt={resource.name} />
                                                                <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-semibold">{resource.name}</p>
                                                                <p className="text-sm text-muted-foreground">{resource.role}</p>
                                                            </div>
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
                                        <p className="text-muted-foreground">No resources allocated yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="suggestions">
                             <AiSuggestions project={project} allResources={resources} />
                         </TabsContent>
                         <TabsContent value="logs">
                             <Card>
                                 <CardHeader>
                                     <CardTitle>Explainability Logs</CardTitle>
                                     <CardDescription>Reasoning behind each allocation.</CardDescription>
                                 </CardHeader>
                                 <CardContent>
                                     <p className="text-muted-foreground">Allocation logs will be implemented here.</p>
                                 </CardContent>
                             </Card>
                         </TabsContent>
                         <TabsContent value="overview">
                             <Card>
                                 <CardHeader>
                                     <CardTitle>Project Overview</CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                     <p className="text-muted-foreground">Project overview will be implemented here.</p>
                                 </CardContent>
                             </Card>
                         </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
