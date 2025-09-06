// Allocates resources based on natural language input using a Gemini-powered chatbot.

'use server';

/**
 * @fileOverview Allocates resources using a Gemini-powered chatbot.
 *
 * - allocateResources - A function that handles resource allocation based on natural language input.
 * - AllocateResourcesInput - The input type for the allocateResources function.
 * - AllocateResourcesOutput - The return type for the allocateResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

export async function allocateResources(input: AllocateResourcesInput): Promise<AllocateResourcesOutput> {
  return allocateResourcesFlow(input);
}

const allocateResourcesPrompt = ai.definePrompt({
  name: 'allocateResourcesPrompt',
  input: {schema: AllocateResourcesInputSchema},
  output: {schema: AllocateResourcesOutputSchema},
  prompt: `You are a resource allocation expert. Based on the following request, allocate resources to the project and provide a summary of the allocation.

Request: {{{request}}}

Allocation Summary: `,
});

const allocateResourcesFlow = ai.defineFlow(
  {
    name: 'allocateResourcesFlow',
    inputSchema: AllocateResourcesInputSchema,
    outputSchema: AllocateResourcesOutputSchema,
  },
  async input => {
    const {output} = await allocateResourcesPrompt(input);
    return output!;
  }
);
