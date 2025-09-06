'use server';

/**
 * @fileOverview A flow for suggesting resolutions for allocation conflicts.
 *
 * This flow analyzes a conflicting allocation and suggests alternative resources.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getProjectById, getResourceById, getResources } from '@/services/firestore-service';

const ResolveConflictInputSchema = z.object({
  projectId: z.string().describe('The ID of the project with the conflict.'),
  resourceId: z.string().describe('The ID of the resource with the conflict.'),
  reasoning: z.string().describe('The original reasoning for the conflicting allocation.'),
});
export type ResolveConflictInput = z.infer<typeof ResolveConflictInputSchema>;

const ResolveConflictOutputSchema = z.object({
  suggestion: z.string().describe('A suggested resolution for the conflict.'),
});
export type ResolveConflictOutput = z.infer<typeof ResolveConflictOutputSchema>;

export async function resolveConflict(input: ResolveConflictInput): Promise<ResolveConflictOutput> {
  return resolveConflictFlow(input);
}

const getResourcesTool = ai.defineTool(
  {
    name: 'getResources',
    description: 'Get a list of all available resources to find an alternative.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({id: z.string(), name: z.string(), role: z.string(), skills: z.array(z.string()), availability: z.number()})),
  },
  async () => {
    const resources = await getResources();
    return resources.map(r => ({id: r.id, name: r.name, role: r.role, skills: r.skills, availability: r.availability}));
  }
);


const prompt = ai.definePrompt({
  name: 'resolveConflictPrompt',
  tools: [getResourcesTool],
  input: { schema: z.object({
    projectId: z.string(),
    resourceId: z.string(),
    reasoning: z.string(),
    project: z.any(),
    resource: z.any(),
  }) },
  output: { schema: ResolveConflictOutputSchema },
  prompt: `You are an expert conflict resolution manager. An allocation was flagged as a conflict with the following reasoning: "{{reasoning}}".

  The project is: {{project.name}}
  The resource is: {{resource.name}} (Skills: {{#each resource.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}})

  The project requires these skills: {{#each project.requiredSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Use the getResources tool to see all available resources. Find a better-suited resource for the project based on skill match and availability.
  
  Suggest a course of action to resolve this. Your suggestion should be specific, like "Reassign this project to [Alternative Resource Name] who has a better skill set." If no better resource is found, suggest providing training to the current one.
  `,
});

const resolveConflictFlow = ai.defineFlow(
  {
    name: 'resolveConflictFlow',
    inputSchema: ResolveConflictInputSchema,
    outputSchema: ResolveConflictOutputSchema,
  },
  async input => {
    const project = await getProjectById(input.projectId);
    const resource = await getResourceById(input.resourceId);

    if (!project || !resource) {
      return { suggestion: "Could not find project or resource to resolve conflict." };
    }

    const { output } = await prompt({ ...input, project, resource });
    return output!;
  }
);
