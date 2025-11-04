
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, DollarSign, ShoppingCart, TrendingDown, Crown } from "lucide-react";
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
import { useProductStore } from "@/store/products";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { isWithinInterval, startOfDay } from "date-fns";

export default function DashboardPage() {
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
        const to = startOfDay(date.to); // Correctly use the end of the day for the 'to' date.
        return isWithinInterval(saleDate, { start: from, end: to });
      }
      return true;
    });
  }, [sales, date]);

  const analysis = useMemo(() => {
    if (filteredSales.length === 0) {
      return {
        totalRevenue: 0,
        totalSales: 0,
        productPerformance: [],
        salesOverTime: [],
      };
    }

    const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
    const totalSales = filteredSales.length;

    const productSales: { [key: string]: { name: string; quantity: number; unit: string | undefined } } = {};
    products.forEach(p => {
        productSales[p.id] = { name: p.name, quantity: 0, unit: p.unit };
    });

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (productSales[item.productId]) {
          productSales[item.productId].quantity += item.quantity;
        }
      });
    });

    const productPerformance = Object.values(productSales)
      .filter(p => p.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity);
      
    const salesByDate: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      const day = format(new Date(sale.date), 'MMM dd');
      if (!salesByDate[day]) {
        salesByDate[day] = 0;
      }
      salesByDate[day] += sale.total;
    });
    
    const salesOverTime = Object.keys(salesByDate).map(date => ({
        date,
        total: salesByDate[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    return {
      totalRevenue,
      totalSales,
      productPerformance,
      salesOverTime
    };

  }, [filteredSales, products]);

  const bestSelling = analysis.productPerformance[0];
  const worstSelling = analysis.productPerformance.length > 1 ? analysis.productPerformance[analysis.productPerformance.length - 1] : null;


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.dashboard} />
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <CardTitle>{t.salesTrendAnalysis}</CardTitle>
                <CardDescription>
                  Review your sales performance over a selected period.
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
                    <p>No sales data for the selected period.</p>
                </div>
            ) : (
                <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{analysis.totalRevenue.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sales</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{analysis.totalSales}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Best Seller</CardTitle>
                            <Crown className="h-4 w-4 text-muted-foreground text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            {bestSelling ? (
                                <>
                                 <div className="text-2xl font-bold">{bestSelling.name}</div>
                                 <p className="text-xs text-muted-foreground">
                                    {bestSelling.quantity} {bestSelling.unit} sold
                                 </p>
                                </>
                            ) : <p>N/A</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Worst Seller</CardTitle>
                             <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {worstSelling ? (
                                <>
                                 <div className="text-2xl font-bold">{worstSelling.name}</div>
                                  <p className="text-xs text-muted-foreground">
                                    {worstSelling.quantity} {worstSelling.unit} sold
                                 </p>
                                </>
                            ) : <p>N/A</p>}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Sales Over Time</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                           <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analysis.salesOverTime} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    content={({ active, payload, label }) =>
                                    active && payload && payload.length ? (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Date
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                                {label}
                                            </span>
                                            </div>
                                            <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Total
                                            </span>
                                            <span className="font-bold">
                                                ₹{payload[0].value?.toFixed(2)}
                                            </span>
                                            </div>
                                        </div>
                                        </div>
                                    ) : null
                                    }
                                />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                            </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
