'use server';

/**
 * @fileOverview AI tool helps analyze sales trends and recommend optimal stock levels.
 *
 * - analyzeSalesTrends - A function that handles the sales trend analysis process.
 * - AnalyzeSalesTrendsInput - The input type for the analyzeSalesTrends function.
 * - AnalyzeSalesTrendsOutput - The return type for the analyzeSalesTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSalesTrendsInputSchema = z.object({
  salesHistory: z
    .string()
    .describe(
      'Sales data including date, product name, quantity sold, and price, in JSON format.'
    ),
  currentStockLevels: z
    .string()
    .describe('Current stock levels for each product, in JSON format.'),
  marketConditions: z.string().optional().describe('Optional: Description of current market conditions affecting sales.'),
});
export type AnalyzeSalesTrendsInput = z.infer<typeof AnalyzeSalesTrendsInputSchema>;

const AnalyzeSalesTrendsOutputSchema = z.object({
  trendSummary: z.string().describe('A summary of the identified sales trends.'),
  stockLevelRecommendations: z
    .string()
    .describe('Recommendations for optimal stock levels for each product.'),
  pricingRecommendations: z
    .string()
    .describe('Recommendations for pricing adjustments based on sales trends.'),
  orderingPlanModifications: z
    .string()
    .describe(
      'Recommendations for modifying ordering plans based on sales trends and stock levels.'
    ),
  additionalInsights: z
    .string()
    .describe('Any additional insights or recommendations.'),
});
export type AnalyzeSalesTrendsOutput = z.infer<typeof AnalyzeSalesTrendsOutputSchema>;

export async function analyzeSalesTrends(input: AnalyzeSalesTrendsInput): Promise<AnalyzeSalesTrendsOutput> {
  return analyzeSalesTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSalesTrendsPrompt',
  input: {schema: AnalyzeSalesTrendsInputSchema},
  output: {schema: AnalyzeSalesTrendsOutputSchema},
  prompt: `You are an AI assistant helping a shop owner analyze sales trends and make informed decisions.

Analyze the following sales history and current stock levels to identify trends and provide recommendations.

Sales History:
{{salesHistory}}

Current Stock Levels:
{{currentStockLevels}}

{{#if marketConditions}}
Market Conditions:
{{marketConditions}}
{{/if}}

Based on this information, provide the following:

- A summary of the identified sales trends.
- Recommendations for optimal stock levels for each product.
- Recommendations for pricing adjustments based on sales trends.
- Recommendations for modifying ordering plans based on sales trends and stock levels.
- Any additional insights or recommendations.

Follow the schema's Zod descriptions for output formatting.
`,
});

const analyzeSalesTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeSalesTrendsFlow',
    inputSchema: AnalyzeSalesTrendsInputSchema,
    outputSchema: AnalyzeSalesTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
