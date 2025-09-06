'use server';

/**
 * @fileOverview Allocates resources using a Gemini-powered chatbot with tools.
 *
 * - allocateResources - A function that handles resource allocation based on natural language input.
 * - AllocateResourcesInput - The input type for the allocateResources function.
 * - AllocateResourcesOutput - The return type for the allocateResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  allocateResource,
  getProjects,
  getResources,
} from '@/services/firestore-service';

const allocateResourceTool = ai.defineTool(
  {
    name: 'allocateResource',
    description: 'Allocate a resource to a project.',
    inputSchema: z.object({
      resourceName: z.string().describe('The name of the resource to allocate.'),
      projectName: z.string().describe('The name of the project to allocate to.'),
    }),
    outputSchema: z.string(),
  },
  async ({resourceName, projectName}) => {
    // In a real app, you'd find the IDs based on names
    const allResources = await getResources();
    const allProjects = await getProjects();
    const resource = allResources.find(r => r.name.toLowerCase() === resourceName.toLowerCase());
    const project = allProjects.find(p => p.name.toLowerCase() === projectName.toLowerCase());

    if (!resource || !project) {
      return 'Could not find the specified resource or project.';
    }

    // Simplified allocation logic for the chatbot
    await allocateResource({
      projectId: project.id,
      resourceId: resource.id,
      match: 80, // Default match for chatbot allocation
      reasoning: `Allocated by AI Assistant via chat.`,
      status: 'partial',
    });

    return `Successfully allocated ${resourceName} to ${projectName}.`;
  }
);

const getProjectsTool = ai.defineTool(
  {
    name: 'getProjects',
    description: 'Get a list of all projects.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({id: z.string(), name: z.string()})),
  },
  async () => {
    const projects = await getProjects();
    return projects.map(p => ({id: p.id, name: p.name}));
  }
);

const getResourcesTool = ai.defineTool(
  {
    name: 'getResources',
    description: 'Get a list of all available resources.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({id: z.string(), name: z.string(), role: z.string()})),
  },
  async () => {
    const resources = await getResources();
    return resources.map(r => ({id: r.id, name: r.name, role: r.role}));
  }
);


const AllocateResourcesInputSchema = z.object({
  request: z
    .string()
    .describe(
      'A natural language request describing the resource needs for a project.'
    ),
});
export type AllocateResourcesInput = z.infer<typeof AllocateResourcesInputSchema>;

const AllocateResourcesOutputSchema = z.object({
  allocationSummary: z
    .string()
    .describe('A summary of the resources allocated based on the request.'),
});

export type AllocateResourcesOutput = z.infer<typeof AllocateResourcesOutputSchema>;

export async function allocateResources(
  input: AllocateResourcesInput
): Promise<AllocateResourcesOutput> {
  return allocateResourcesFlow(input);
}

const allocateResourcesPrompt = ai.definePrompt({
  name: 'allocateResourcesPrompt',
  input: {schema: AllocateResourcesInputSchema},
  tools: [allocateResourceTool, getProjectsTool, getResourcesTool],
  prompt: `You are a resource allocation expert. Based on the following request, use the available tools to get information or allocate resources.

Request: {{{request}}}

Provide a helpful summary to the user based on the tool output.`,
});

const allocateResourcesFlow = ai.defineFlow(
  {
    name: 'allocateResourcesFlow',
    inputSchema: AllocateResourcesInputSchema,
    outputSchema: AllocateResourcesOutputSchema,
  },
  async input => {
    const llmResponse = await allocateResourcesPrompt(input);
    const text = llmResponse.text;

    return { allocationSummary: text };
  }
);
