
"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_SALES } from "@/lib/constants";
import type { Sale } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";
import { analyzeSalesTrends, type AnalyzeSalesTrendsOutput } from "@/ai/flows/analyze-sales-trends";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductStore } from "@/store/products";

export default function DashboardPage() {
  const { t } = useTranslation();
  const products = useProductStore((state) => state.products);
  const [sales] = useState<Sale[]>(MOCK_SALES);
  
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
      {[...Array(2)].map((_, i) => (
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  });

  const todaysTotal = todaysSales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.dashboard} />
      <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <CardTitle>{t.salesTrendAnalysis}</CardTitle>
                  <CardDescription>
                    Get advice on how to improve your sales and manage stock.
                  </CardDescription>
                </div>
                <Button onClick={handleAnalyze} disabled={loading} className="w-full sm:w-auto">
                  <TrendingUp className="mr-2 h-4 w-4" />
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Today's Sales</CardTitle>
                    <CardDescription>
                        A summary of sales made today. Total: ₹{todaysTotal.toFixed(2)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Products</TableHead>
                                <TableHead className="text-right">{t.total}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {todaysSales.length > 0 ? (
                                todaysSales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>
                                    {sale.items.map(item => {
                                        const product = products.find(p => p.id === item.productId);
                                        return <div key={item.productId}>{product?.name || 'Unknown'} x {item.quantity} {product?.unit}</div>
                                    })}
                                    </TableCell>
                                    <TableCell className="text-right">₹{sale.total.toFixed(2)}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">No sales today. Keep going!</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
