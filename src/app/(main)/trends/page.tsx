"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Package, TrendingUp, PieChart, AlertTriangle } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useProductStore } from "@/store/products";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { isWithinInterval, startOfDay } from "date-fns";

export default function TrendsPage() {
  const { t } = useTranslation();
  const { products, sales } = useProductStore();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      if (date?.from && date?.to) {
        const from = startOfDay(date.from);
        const to = date.to;
        return isWithinInterval(saleDate, { start: from, end: to });
      }
      return true;
    });
  }, [sales, date]);

  const analysis = useMemo(() => {
    const salesOverTime = filteredSales.reduce((acc, sale) => {
      const day = format(new Date(sale.date), 'MMM dd');
      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day] += sale.total;
      return acc;
    }, {} as Record<string, number>);

    const productSales = filteredSales.flatMap(s => s.items).reduce((acc, item) => {
        if(!acc[item.productId]){
            acc[item.productId] = 0;
        }
        acc[item.productId] += item.quantity;
        return acc;
    }, {} as Record<string, number>);
    
    const top5Products = Object.entries(productSales)
      .map(([productId, quantity]) => ({
        name: products.find(p => p.id === productId)?.name || 'Unknown',
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const revenueByCategory = filteredSales.reduce((acc, sale) => {
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if(product) {
                if(!acc[product.category]){
                    acc[product.category] = 0;
                }
                acc[product.category] += item.priceAtSale * item.quantity;
            }
        });
        return acc;
    }, {} as Record<string, number>);

    const lowStockProducts = products.filter(p => p.stock < p.lowStockThreshold);

    return {
      salesOverTime: Object.entries(salesOverTime).map(([date, total]) => ({ date, total })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      top5Products,
      revenueByCategory: Object.entries(revenueByCategory).map(([name, value]) => ({ name, value })),
      lowStockProducts,
    };
  }, [filteredSales, products]);
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.trends} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Sales Trends</h1>
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[240px] sm:w-[300px] justify-start text-left font-normal",
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
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/>Sales Trend Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analysis.salesOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5"/>Top 5 Selling Products</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysis.top5Products} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5"/>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={analysis.revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                 {analysis.revenueByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500"/>Low Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] overflow-auto">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analysis.lowStockProducts.length > 0 ? analysis.lowStockProducts.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell className="text-right">{p.stock}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">No low stock items!</TableCell>
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
