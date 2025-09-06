'use server';

/**
 * @fileOverview A flow for suggesting resolutions for allocation conflicts.
 *
 * This flow is a placeholder to demonstrate where conflict resolution logic would go.
 * In a real implementation, it would find better-suited resources or projects.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getProjectById, getResourceById } from '@/services/firestore-service';

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

const prompt = ai.definePrompt({
  name: 'resolveConflictPrompt',
  input: { schema: ResolveConflictInputSchema },
  output: { schema: ResolveConflictOutputSchema },
  prompt: `You are an expert conflict resolution manager. An allocation was flagged as a conflict with the following reasoning: "{{reasoning}}".

  The project is: {{project.name}}
  The resource is: {{resource.name}}

  Suggest a course of action to resolve this. For example, suggest finding a different resource or providing training to the current one.
  This is a placeholder prompt. In a real system, you would have tools to find alternative resources or projects.
  `,
});

const resolveConflictFlow = ai.defineFlow(
  {
    name: 'resolveConflictFlow',
    inputSchema: ResolveConflictInputSchema,
    outputSchema: ResolveConflictOutputSchema,
  },
  async input => {
    // In a real app, you would use tools to find better matches.
    // This is a simplified placeholder.
    const project = await getProjectById(input.projectId);
    const resource = await getResourceById(input.resourceId);

    if (!project || !resource) {
      return { suggestion: "Could not find project or resource to resolve conflict." };
    }

    const { output } = await prompt({ ...input, project, resource });
    return output!;
  }
);
