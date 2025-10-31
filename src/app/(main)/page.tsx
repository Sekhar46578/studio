
"use client";

import { useState } from "react";
import { TrendingDown, Crown, BarChart2 } from "lucide-react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { subDays, startOfDay, isWithinInterval } from "date-fns";

type TimeRange = "daily" | "weekly" | "monthly" | "yearly";

export default function DashboardPage() {
  const { t } = useTranslation();
  const products = useProductStore((state) => state.products);
  const sales = useProductStore((state) => state.sales);
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  });

  const todaysTotal = todaysSales.reduce((acc, sale) => acc + sale.total, 0);

  const getInterval = (range: TimeRange) => {
    const now = new Date();
    switch (range) {
      case "daily":
        return { start: startOfDay(now), end: now };
      case "weekly":
        return { start: subDays(now, 7), end: now };
      case "monthly":
        return { start: subDays(now, 30), end: now };
      case "yearly":
        return { start: subDays(now, 365), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const salesInInterval = sales.filter(sale => 
    isWithinInterval(new Date(sale.date), getInterval(timeRange))
  );

  const productSales = products.map(product => {
    const totalSold = salesInInterval.reduce((acc, sale) => {
      const item = sale.items.find(item => item.productId === product.id);
      return acc + (item ? item.quantity : 0);
    }, 0);
    return { name: product.name, sold: totalSold, unit: product.unit };
  }).sort((a, b) => b.sold - a.sold);
  
  const allTimeProductSales = products.map(product => {
    const totalSold = sales.reduce((acc, sale) => {
      const item = sale.items.find(item => item.productId === product.id);
      return acc + (item ? item.quantity : 0);
    }, 0);
    return { name: product.name, sold: totalSold, unit: product.unit };
  }).sort((a, b) => b.sold - a.sold);


  const bestSelling = allTimeProductSales[0];
  const worstSelling = allTimeProductSales.length > 1 ? allTimeProductSales[allTimeProductSales.length - 1] : null;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.dashboard} />
      <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        <Card className="lg:col-span-3">
          <Tabs defaultValue="monthly" onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Product Sales Performance</CardTitle>
                  <CardDescription>
                    Units sold per product over the selected time period.
                  </CardDescription>
                </div>
                <TabsList className="grid w-full sm:w-[300px] grid-cols-4 mt-4 sm:mt-0">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
               {productSales.some(p => p.sold > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productSales.filter(p => p.sold > 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sold" fill="hsl(var(--primary))" name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
               ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <BarChart2 className="h-12 w-12 mb-4" />
                    <p className="text-lg font-semibold">No sales data available</p>
                    <p>There are no sales in the selected time range.</p>
                </div>
               )}
            </CardContent>
          </Tabs>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Selling Product (All Time)
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
              Needs Attention (All Time)
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
