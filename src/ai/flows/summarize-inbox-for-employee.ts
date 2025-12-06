'use server';
/**
 * @fileOverview Summarizes the important emails for an employee.
 *
 * - summarizeInboxForEmployee - A function that summarizes the inbox for an employee.
 * - SummarizeInboxForEmployeeInput - The input type for the summarizeInboxForEmployee function.
 * - SummarizeInboxForEmployeeOutput - The return type for the summarizeInboxForEmployee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInboxForEmployeeInputSchema = z.object({
  emails: z
    .array(z.string())
    .describe('A list of email messages as strings.'),
});
export type SummarizeInboxForEmployeeInput = z.infer<typeof SummarizeInboxForEmployeeInputSchema>;

const SummarizeInboxForEmployeeOutputSchema = z.object({
  summary: z.string().describe('A summary of the important emails.'),
});
export type SummarizeInboxForEmployeeOutput = z.infer<typeof SummarizeInboxForEmployeeOutputSchema>;

export async function summarizeInboxForEmployee(input: SummarizeInboxForEmployeeInput): Promise<SummarizeInboxForEmployeeOutput> {
  return summarizeInboxForEmployeeFlow(input);
}

const summarizeInboxForEmployeePrompt = ai.definePrompt({
  name: 'summarizeInboxForEmployeePrompt',
  input: {schema: SummarizeInboxForEmployeeInputSchema},
  output: {schema: SummarizeInboxForEmployeeOutputSchema},
  prompt: `You are an AI assistant helping an employee summarize their inbox.

  Given the following emails, provide a short summary of the key information:

  {{#each emails}}
  -- Email {{@index + 1}} --
  {{this}}
  {{/each}}
  `,
});

const summarizeInboxForEmployeeFlow = ai.defineFlow(
  {
    name: 'summarizeInboxForEmployeeFlow',
    inputSchema: SummarizeInboxForEmployeeInputSchema,
    outputSchema: SummarizeInboxForEmployeeOutputSchema,
  },
  async input => {
    const {output} = await summarizeInboxForEmployeePrompt(input);
    return output!;
  }
);
