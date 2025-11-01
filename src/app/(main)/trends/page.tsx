
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/lib/hooks/use-translation";
import { analyzeSalesTrends, type AnalyzeSalesTrendsOutput } from "@/ai/flows/analyze-sales-trends";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useProductStore } from "@/store/products";
import { cn } from "@/lib/utils";

export default function TrendsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSalesTrendsOutput | null>(null);
  const { products, sales } = useProductStore();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        if (date?.from && date?.to) {
          return saleDate >= date.from && saleDate <= date.to;
        }
        return true;
      });

      const salesHistory = JSON.stringify(filteredSales);
      const currentStockLevels = JSON.stringify(
        products.map(p => ({ name: p.name, stock: p.stock }))
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <CardTitle>{t.salesTrendAnalysis}</CardTitle>
                <CardDescription>
                  Get advice on how to improve your sales and manage stock.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>{t.pickADate}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={handleAnalyze} disabled={loading} className="w-full sm:w-auto">
                  {loading ? t.analyzing : t.analyzeTrends}
                </Button>
              </div>
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
             {!loading && !analysisResult && !error && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
                <p>Select a date range and click "Analyze Sales" to see your trends.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
