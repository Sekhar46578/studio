
"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductStore } from "@/store/products";
import Link from "next/link";

export default function DashboardPage() {
  const { t } = useTranslation();
  const products = useProductStore((state) => state.products);
  const [sales] = useState<Sale[]>(MOCK_SALES);
  
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
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/trends">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {t.analyzeTrends}
                    </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Click the &quot;{t.analyzeTrends}&quot; button to get a detailed analysis of your sales trends, stock recommendations, and more on the Trends page.
                </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Today&apos;s Sales</CardTitle>
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
