
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Product, Sale } from '@/lib/types';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number(),
  lowStockThreshold: z.number(),
  category: z.string(),
  imageUrl: z.string().url(),
  unit: z.string().optional(),
});

const SaleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  priceAtSale: z.number(),
});

const SaleSchema = z.object({
  id: z.string(),
  date: z.string(),
  items: z.array(SaleItemSchema),
  total: z.number(),
});

const GenerateReportInputSchema = z.object({
  products: z.array(ProductSchema),
  sales: z.array(SaleSchema),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  trendSummary: z.string().describe("A summary of sales trends. Should be in Markdown format."),
  stockRecommendations: z.string().describe("Recommendations for stock levels. Should be in Markdown format."),
  additionalInsights: z.string().describe("Any other insights or recommendations. Should be in Markdown format."),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

const reportPrompt = `You are a business analyst for a small retail shop. Analyze the provided sales and product data to generate a report.
  The data covers the period from {dateRange.from} to {dateRange.to}.
  
  Products:
  {json products}

  Sales:
  {json sales}

  Provide a concise report covering:
  1.  **Trend Summary**: What are the key sales trends? Are sales going up or down? What are the top-selling products in the period?
  2.  **Stock Recommendations**: Based on sales velocity and current stock, which items should be re-ordered soon? Are any items overstocked?
  3.  **Additional Insights**: Are there any other interesting patterns, like products often bought together, or opportunities to increase sales?
  
  Format the entire response in Markdown. Use headings, bold text, and bullet points to make it readable.`;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: reportPrompt,
    input: input,
    output: {
      schema: GenerateReportOutputSchema,
    },
  });
  return output!;
}
