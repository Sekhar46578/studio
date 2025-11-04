
"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/hooks/use-translation";
import { getMarketTrends, type MarketTrendsOutput } from "@/ai/flows/get-market-trends";

export default function TrendsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("What are the latest trends in the Indian grocery market for 2024?");
  const [analysis, setAnalysis] = useState<MarketTrendsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await getMarketTrends({ query });
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError("Sorry, I couldn't fetch the market trends. Please try again later.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.trends} />
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Trend Analysis</CardTitle>
            <CardDescription>
              Get AI-powered insights into the current market trends for your business.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="e.g., What are the latest trends in the Indian grocery market?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading || !query.trim()}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? "Analyzing..." : "Analyze Market Trends"}
            </Button>

            {isLoading && (
                <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}
            
            {error && (
                <div className="text-red-500 p-4 border border-red-500/50 bg-red-500/10 rounded-md">
                    {error}
                </div>
            )}

            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-foreground">
                  <div dangerouslySetInnerHTML={{ __html: analysis.analysisHtml }} />
                </CardContent>
              </Card>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
