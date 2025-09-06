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
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        skills: z.array(z.string()),
        availability: z.number(),
      })
    )
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
    .array(
      z.object({
        resourceId: z.string().describe('The ID of the resource being recommended.'),
        resourceName: z.string().describe('The name of the resource.'),
        matchPercentage: z
          .number()
          .describe('The percentage match of the resource for the project.'),
        reasoning: z
          .string()
          .describe('Explanation for recommending the resource, detailing skill matches and availability.'),
      })
    )
    .describe('An array of top 3 resource recommendations, detailing which resources are best for the project.'),
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
  prompt: `You are an expert resource allocation manager. You are provided with a project description, a list of available resource profiles, and priority factors.

  Project Description:
  {{{projectDescription}}}

  Available Resource Profiles:
  {{#each resourceProfiles}}
  - Name: {{this.name}} (ID: {{this.id}})
    Skills: {{#each this.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    Availability: {{this.availability}} hours/week
  {{/each}}

  Priority Factors for Matching: {{{priorityFactors}}}

  Based on this information, identify the top 3 best-suited resources for the project. For each recommendation, provide the resource's ID, name, a match percentage, and a concise reasoning for why they are a good fit, considering their skills and availability against the project needs.

  Return the resource recommendations in the specified JSON format.
  `,
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
