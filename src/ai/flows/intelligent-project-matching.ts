'use server';

/**
 * @fileOverview A flow for intelligently matching projects to a resource based on skills, deadlines, and priority.
 *
 * - intelligentProjectMatching - A function that handles the project matching process.
 * - IntelligentProjectMatchingInput - The input type for the intelligentProjectMatching function.
 * - IntelligentProjectMatchingOutput - The return type for the intelligentProjectMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentProjectMatchingInputSchema = z.object({
  resourceProfile: z
    .object({
      id: z.string(),
      name: z.string(),
      skills: z.array(z.string()),
      availability: z.number(),
    })
    .describe('The profile of the resource for whom we are finding a project.'),
  projectProfiles: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        requiredSkills: z.array(z.string()),
        deadline: z.string(),
        priority: z.string(),
      })
    )
    .describe('An array of project profiles, each containing required skills, deadline, and priority.'),
});
export type IntelligentProjectMatchingInput = z.infer<
  typeof IntelligentProjectMatchingInputSchema
>;

const IntelligentProjectMatchingOutputSchema = z.object({
  projectAllocations: z
    .array(
      z.object({
        projectId: z.string().describe('The ID of the project being recommended.'),
        projectName: z.string().describe('The name of the project.'),
        matchPercentage: z
          .number()
          .describe('The percentage match of the resource for the project.'),
        reasoning: z
          .string()
          .describe('Explanation for recommending the project, detailing skill matches and deadline alignment.'),
      })
    )
    .describe('An array of top 3 project recommendations, detailing which projects are best for the resource.'),
});
export type IntelligentProjectMatchingOutput = z.infer<
  typeof IntelligentProjectMatchingOutputSchema
>;

export async function intelligentProjectMatching(
  input: IntelligentProjectMatchingInput
): Promise<IntelligentProjectMatchingOutput> {
  return intelligentProjectMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentProjectMatchingPrompt',
  input: {schema: IntelligentProjectMatchingInputSchema},
  output: {schema: IntelligentProjectMatchingOutputSchema},
  prompt: `You are an expert resource allocation manager. You are provided with a resource profile and a list of available projects.

  Resource Profile:
  - Name: {{resourceProfile.name}}
    Skills: {{#each resourceProfile.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    Availability: {{resourceProfile.availability}} hours/week

  Available Projects:
  {{#each projectProfiles}}
  - Name: {{this.name}} (ID: {{this.id}})
    Required Skills: {{#each this.requiredSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    Deadline: {{this.deadline}}
    Priority: {{this.priority}}
  {{/each}}

  Based on this information, identify the top 3 best-suited projects for the resource. For each recommendation, provide the project's ID, name, a match percentage, and a concise reasoning for why it's a good fit, considering the resource's skills against the project needs and deadline.

  Return the project recommendations in the specified JSON format.
  `,
});

const intelligentProjectMatchingFlow = ai.defineFlow(
  {
    name: 'intelligentProjectMatchingFlow',
    inputSchema: IntelligentProjectMatchingInputSchema,
    outputSchema: IntelligentProjectMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
