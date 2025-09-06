'use server';
/**
 * @fileOverview Extracts skills from a resource CV using AI.
 *
 * - extractSkillsFromResourceCv - A function that handles the skill extraction process.
 * - ExtractSkillsFromResourceCvInput - The input type for the extractSkillsFromResourceCv function.
 * - ExtractSkillsFromResourceCvOutput - The return type for the extractSkillsFromResourceCv function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractSkillsFromResourceCvInputSchema = z.object({
  cvDataUri: z
    .string()
    .describe(
      "The resource CV, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractSkillsFromResourceCvInput = z.infer<typeof ExtractSkillsFromResourceCvInputSchema>;

const ExtractSkillsFromResourceCvOutputSchema = z.object({
  skills: z.array(z.string()).describe('The skills extracted from the resource CV.'),
  explanation: z.string().describe('Explanation of how the skills were extracted.'),
});
export type ExtractSkillsFromResourceCvOutput = z.infer<typeof ExtractSkillsFromResourceCvOutputSchema>;

export async function extractSkillsFromResourceCv(input: ExtractSkillsFromResourceCvInput): Promise<ExtractSkillsFromResourceCvOutput> {
  return extractSkillsFromResourceCvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractSkillsFromResourceCvPrompt',
  input: {schema: ExtractSkillsFromResourceCvInputSchema},
  output: {schema: ExtractSkillsFromResourceCvOutputSchema},
  prompt: `You are an expert in extracting skills from CVs.\n\n  Please extract the skills from the following CV.\n\n  CV: {{media url=cvDataUri}}\n\n  Return a list of skills and an explanation of how you extracted them.`,
});

const extractSkillsFromResourceCvFlow = ai.defineFlow(
  {
    name: 'extractSkillsFromResourceCvFlow',
    inputSchema: ExtractSkillsFromResourceCvInputSchema,
    outputSchema: ExtractSkillsFromResourceCvOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
