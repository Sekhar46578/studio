
'use server';
/**
 * @fileOverview A market trend analysis AI flow.
 *
 * - getMarketTrends - A function that returns analysis on market trends.
 * - MarketTrendsInput - The input type for the getMarketTrends function.
 * - MarketTrendsOutput - The return type for the getMarketTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {marked} from 'marked';

const MarketTrendsInputSchema = z.object({
  query: z.string().describe('The user\'s query about market trends.'),
});
export type MarketTrendsInput = z.infer<typeof MarketTrendsInputSchema>;

const MarketTrendsOutputSchema = z.object({
  analysis: z.string().describe('The market trend analysis in Markdown format.'),
});

// We are not exporting this type because we will transform the output.
type MarketTrendsOutput = z.infer<typeof MarketTrendsOutputSchema>;

export type MarketTrendsClientOutput = {
  analysisHtml: string;
};


export async function getMarketTrends(input: MarketTrendsInput): Promise<MarketTrendsClientOutput> {
    const result = await marketTrendsFlow(input);
    const html = await marked(result.analysis);
    return {
        analysisHtml: html,
    };
}

const prompt = ai.definePrompt({
  name: 'marketTrendsPrompt',
  input: {schema: MarketTrendsInputSchema},
  output: {schema: MarketTrendsOutputSchema},
  prompt: `You are a market analyst expert for small to medium-sized retail businesses in India.
  Your goal is to provide a concise, insightful, and easy-to-understand analysis of market trends based on the user's query.

  User Query:
  "{{{query}}}"

  Provide a response in Markdown format. Use headings, bold text, and bullet points to structure the information clearly.
  Start with a summary, then provide key trends, and finish with actionable advice for a shop owner.
  `,
});

const marketTrendsFlow = ai.defineFlow(
  {
    name: 'marketTrendsFlow',
    inputSchema: MarketTrendsInputSchema,
    outputSchema: MarketTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
