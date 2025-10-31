
"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Crown } from "lucide-react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

  const productSales = products.map(product => {
    const totalSold = sales.reduce((acc, sale) => {
      const item = sale.items.find(item => item.productId === product.id);
      return acc + (item ? item.quantity : 0);
    }, 0);
    return { name: product.name, sold: totalSold, unit: product.unit };
  }).sort((a, b) => b.sold - a.sold);

  const bestSelling = productSales[0];
  const worstSelling = productSales.length > 1 ? productSales[productSales.length - 1] : null;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.dashboard} />
      <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Product Sales Performance</CardTitle>
            <CardDescription>
              A look at how many units of each product have been sold.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productSales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sold" fill="hsl(var(--primary))" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Selling Product
            </CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground text-yellow-500" />
          </CardHeader>
          <CardContent>
             {bestSelling && (
              <>
                <div className="text-2xl font-bold">{bestSelling.name}</div>
                <p className="text-xs text-muted-foreground">
                  {bestSelling.sold} {bestSelling.unit} sold
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Needs Attention
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {worstSelling && (
              <>
                <div className="text-2xl font-bold">{worstSelling.name}</div>
                <p className="text-xs text-muted-foreground">
                  Only {worstSelling.sold} {worstSelling.unit} sold
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Today&apos;s Sales</CardTitle>
            <CardDescription>
              Total: ₹{todaysTotal.toFixed(2)}
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

      </main>
    </div>
  );
}
