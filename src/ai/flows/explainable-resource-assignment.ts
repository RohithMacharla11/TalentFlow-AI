'use server';

/**
 * @fileOverview Provides ranked reasoning for resource assignments.
 *
 * - explainableResourceAssignment - A function that returns the ranked reasoning for each resource assignment.
 * - ExplainableResourceAssignmentInput - The input type for the explainableResourceAssignment function.
 * - ExplainableResourceAssignmentOutput - The return type for the explainableResourceAssignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainableResourceAssignmentInputSchema = z.object({
  resourceSkills: z.string().describe('Skills of the resource.'),
  projectRequirements: z.string().describe('Skills required for the project.'),
  resourceAvailability: z.string().describe('Resource availability in hours.'),
  projectDeadline: z.string().describe('Project deadline.'),
  resourceName: z.string().describe('Name of the resource.'),
});

export type ExplainableResourceAssignmentInput = z.infer<
  typeof ExplainableResourceAssignmentInputSchema
>;

const ExplainableResourceAssignmentOutputSchema = z.object({
  reasoning: z.string().describe('Ranked reasoning for the resource assignment.'),
});

export type ExplainableResourceAssignmentOutput = z.infer<
  typeof ExplainableResourceAssignmentOutputSchema
>;

export async function explainableResourceAssignment(
  input: ExplainableResourceAssignmentInput
): Promise<ExplainableResourceAssignmentOutput> {
  return explainableResourceAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainableResourceAssignmentPrompt',
  input: {schema: ExplainableResourceAssignmentInputSchema},
  output: {schema: ExplainableResourceAssignmentOutputSchema},
  prompt: `You are an AI assistant providing ranked reasoning for resource assignments.

  Given the following information about a resource and a project, provide a ranked list of reasons why this resource is a good fit for the project.

  Resource Name: {{resourceName}}
  Resource Skills: {{resourceSkills}}
  Resource Availability: {{resourceAvailability}}
  Project Requirements: {{projectRequirements}}
  Project Deadline: {{projectDeadline}}

  Format the output as a ranked list of reasons, including a percentage skill match, the resource's availability in hours, and whether the resource's availability aligns with the project deadline.  Include a summary sentence at the end that indicates overall suitability.
  `,
});

const explainableResourceAssignmentFlow = ai.defineFlow(
  {
    name: 'explainableResourceAssignmentFlow',
    inputSchema: ExplainableResourceAssignmentInputSchema,
    outputSchema: ExplainableResourceAssignmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
