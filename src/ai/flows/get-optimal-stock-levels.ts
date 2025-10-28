'use server';
/**
 * @fileOverview Analyzes sales trends and recommends optimal stock levels.
 *
 * - getOptimalStockLevels - A function that analyzes sales data and recommends optimal stock levels.
 * - GetOptimalStockLevelsInput - The input type for the getOptimalStockLevels function.
 * - GetOptimalStockLevelsOutput - The return type for the getOptimalStockLevels function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetOptimalStockLevelsInputSchema = z.object({
  salesData: z.string().describe('Historical sales data in JSON format.'),
  currentStockLevels: z.string().describe('Current stock levels in JSON format.'),
  productName: z.string().describe('The name of the product to analyze.'),
});
export type GetOptimalStockLevelsInput = z.infer<typeof GetOptimalStockLevelsInputSchema>;

const GetOptimalStockLevelsOutputSchema = z.object({
  recommendedStockLevel: z.number().describe('The recommended stock level for the product.'),
  reasoning: z.string().describe('The reasoning behind the recommended stock level.'),
  potentialActions: z.string().describe('Suggested actions regarding ordering, pricing, or sales parameters.'),
});
export type GetOptimalStockLevelsOutput = z.infer<typeof GetOptimalStockLevelsOutputSchema>;

export async function getOptimalStockLevels(input: GetOptimalStockLevelsInput): Promise<GetOptimalStockLevelsOutput> {
  return getOptimalStockLevelsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getOptimalStockLevelsPrompt',
  input: {schema: GetOptimalStockLevelsInputSchema},
  output: {schema: GetOptimalStockLevelsOutputSchema},
  prompt: `You are an expert in inventory management and sales analysis. Analyze the provided sales data and current stock levels for a given product to recommend an optimal stock level. Provide clear reasoning for your recommendation and suggest potential actions to improve sales and minimize waste.

Product Name: {{{productName}}}
Sales Data: {{{salesData}}}
Current Stock Levels: {{{currentStockLevels}}}

Respond with a recommended stock level, the reasoning behind it, and potential actions regarding ordering, pricing, or other sales parameters. Focus on minimizing waste and maximizing profits.`,
});

const getOptimalStockLevelsFlow = ai.defineFlow(
  {
    name: 'getOptimalStockLevelsFlow',
    inputSchema: GetOptimalStockLevelsInputSchema,
    outputSchema: GetOptimalStockLevelsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
