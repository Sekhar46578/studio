"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/lib/hooks/use-translation";
import { analyzeSalesTrends, type AnalyzeSalesTrendsOutput } from "@/ai/flows/analyze-sales-trends";
import { INITIAL_PRODUCTS, MOCK_SALES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function TrendsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSalesTrendsOutput | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const salesHistory = JSON.stringify(MOCK_SALES);
      const currentStockLevels = JSON.stringify(
        INITIAL_PRODUCTS.map(p => ({ name: p.name, stock: p.stock }))
      );

      const result = await analyzeSalesTrends({ salesHistory, currentStockLevels });
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      setError(t.analysisError);
    } finally {
      setLoading(false);
    }
  };

  const AnalysisSkeleton = () => (
    <div className="grid gap-6 mt-6 md:grid-cols-2">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.trends} />
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <CardTitle>{t.salesTrendAnalysis}</CardTitle>
                <CardDescription>
                  Use AI to analyze sales trends and get recommendations.
                </CardDescription>
              </div>
              <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? t.analyzing : t.analyzeTrends}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {loading && <AnalysisSkeleton />}
            {analysisResult && (
              <div className="grid gap-6 mt-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>{t.trendSummary}</CardTitle></CardHeader>
                  <CardContent><p>{analysisResult.trendSummary}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{t.stockRecommendations}</CardTitle></CardHeader>
                  <CardContent><p className="whitespace-pre-line">{analysisResult.stockLevelRecommendations}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{t.pricingRecommendations}</CardTitle></CardHeader>
                  <CardContent><p className="whitespace-pre-line">{analysisResult.pricingRecommendations}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{t.orderingPlanModifications}</CardTitle></CardHeader>
                  <CardContent><p className="whitespace-pre-line">{analysisResult.orderingPlanModifications}</p></CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                  <CardHeader><CardTitle>{t.additionalInsights}</CardTitle></CardHeader>
                  <CardContent><p>{analysisResult.additionalInsights}</p></CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
