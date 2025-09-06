'use server';

/**
 * @fileOverview A flow for intelligently matching resources to projects based on skills, availability, and priority.
 *
 * - intelligentResourceMatching - A function that handles the resource matching process.
 * - IntelligentResourceMatchingInput - The input type for the intelligentResourceMatching function.
 * - IntelligentResourceMatchingOutput - The return type for the intelligentResourceMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentResourceMatchingInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A detailed description of the project, including required skills and priorities.'),
  resourceProfiles: z
    .string()
    .array()
    .describe('An array of resource profiles, each containing skills, availability, and other relevant information.'),
  priorityFactors: z
    .string()
    .describe('The criteria for matching resources to projects, including skills, availability, and project priority.'),
});
export type IntelligentResourceMatchingInput = z.infer<
  typeof IntelligentResourceMatchingInputSchema
>;

const IntelligentResourceMatchingOutputSchema = z.object({
  resourceAllocations: z
    .object({
      resourceId: z.string().describe('The ID of the resource allocated.'),
      projectId: z.string().describe('The ID of the project the resource is allocated to.'),
      allocationPercentage: z
        .number()
        .describe('The percentage of the resource allocated to the project.'),
      reasoning: z
        .string()
        .describe('Explanation for assigning the resource, detailing skill matches and availability.'),
    })
    .array()
    .describe('An array of resource allocations, detailing which resources are assigned to which projects.'),
  conflictAlerts: z
    .string()
    .array()
    .describe('An array of conflict alerts, highlighting any resource allocation conflicts.'),
});
export type IntelligentResourceMatchingOutput = z.infer<
  typeof IntelligentResourceMatchingOutputSchema
>;

export async function intelligentResourceMatching(
  input: IntelligentResourceMatchingInput
): Promise<IntelligentResourceMatchingOutput> {
  return intelligentResourceMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentResourceMatchingPrompt',
  input: {schema: IntelligentResourceMatchingInputSchema},
  output: {schema: IntelligentResourceMatchingOutputSchema},
  prompt: `You are an expert resource allocation manager. You are provided with a project description, a list of resource profiles, and priority factors.

  Project Description: {{{projectDescription}}}
  Resource Profiles: {{#each resourceProfiles}}{{{this}}} {{/each}}
  Priority Factors: {{{priorityFactors}}}

  Based on this information, allocate resources to the project, considering skills, availability, and priority. Explain your reasoning for each assignment. Identify any potential conflicts in resource allocation.
  Return the resource allocations and conflict alerts in the specified JSON format.
  `, // Add Handlebars code here to format output
});

const intelligentResourceMatchingFlow = ai.defineFlow(
  {
    name: 'intelligentResourceMatchingFlow',
    inputSchema: IntelligentResourceMatchingInputSchema,
    outputSchema: IntelligentResourceMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
