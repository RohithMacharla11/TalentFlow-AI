'use server';
/**
 * @fileOverview Extracts structured information from a resource CV using AI.
 *
 * - extractInfoFromCv - A function that handles the information extraction process.
 * - ExtractInfoFromCvInput - The input type for the extractInfoFromCv function.
 * - ExtractInfoFromCvOutput - The return type for the extractInfoFromCv function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInfoFromCvInputSchema = z.object({
  cvDataUri: z
    .string()
    .describe(
      "The resource CV, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractInfoFromCvInput = z.infer<typeof ExtractInfoFromCvInputSchema>;

const ExtractInfoFromCvOutputSchema = z.object({
  name: z.string().describe('The full name of the person.'),
  email: z.string().describe('The email address of the person.'),
  skills: z.array(z.string()).describe('The skills extracted from the resource CV.'),
  seniority: z.enum(['Intern', 'Junior', 'Mid-level', 'Senior', 'Lead']).describe('The inferred seniority level of the person.'),
});
export type ExtractInfoFromCvOutput = z.infer<typeof ExtractInfoFromCvOutputSchema>;

export async function extractInfoFromCv(input: ExtractInfoFromCvInput): Promise<ExtractInfoFromCvOutput> {
  return extractInfoFromCvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractInfoFromCvPrompt',
  input: {schema: ExtractInfoFromCvInputSchema},
  output: {schema: ExtractInfoFromCvOutputSchema},
  prompt: `You are an expert at parsing CVs and extracting key information.  Please extract the person's full name, their email address, a list of their skills, and determine their seniority level from the following CV.

  CV: {{media url=cvDataUri}}
  
  Return the information in the specified JSON format.`,
});

const extractInfoFromCvFlow = ai.defineFlow(
  {
    name: 'extractInfoFromCvFlow',
    inputSchema: ExtractInfoFromCvInputSchema,
    outputSchema: ExtractInfoFromCvOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
