
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Package, TrendingUp, AlertTriangle, FileText } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
} from "recharts";
import { isWithinInterval, startOfDay } from "date-fns";
import { generateReport, GenerateReportOutput } from "@/ai/flows/generate-report";
import { ScrollArea } from "@/components/ui/scroll-area";
import { marked } from "marked";

export default function TrendsPage() {
  const { t } = useTranslation();
  const { products, sales } = useProductStore();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [isReportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportContent, setReportContent] = useState<GenerateReportOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);


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
            acc[item.productId] = { quantity: 0, name: products.find(p => p.id === item.productId)?.name || 'Unknown' };
        }
        acc[item.productId].quantity += item.quantity;
        return acc;
    }, {} as Record<string, {quantity: number, name: string}>);
    
    const top5Products = Object.entries(productSales)
      .map(([productId, data]) => ({
        name: data.name,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

    return {
      salesOverTime: Object.entries(salesOverTime).map(([date, total]) => ({ date, total })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      top5Products,
      lowStockProducts,
    };
  }, [filteredSales, products]);
  
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReportDialogOpen(true);
    try {
        const report = await generateReport({
            products,
            sales: filteredSales,
            dateRange: {
                from: date?.from?.toISOString() || '',
                to: date?.to?.toISOString() || '',
            }
        });
        setReportContent(report);
    } catch (error) {
        console.error("Failed to generate report:", error);
        // You might want to show a toast notification here
    } finally {
        setIsGenerating(false);
    }
  };

  const renderMarkdown = (content: string) => {
    if (!content) return null;
    const rawMarkup = marked(content);
    // TODO: Sanitize this before rendering
    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: rawMarkup as string }} />;
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.trends} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Sales Trends</h1>
             <div className="flex items-center gap-2">
                <Button onClick={handleGenerateReport} disabled={isGenerating}>
                    <FileText className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate AI Report"}
                </Button>
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
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
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
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}}/>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="quantity" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
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
        <Dialog open={isReportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>AI Generated Report</DialogTitle>
                    <DialogDescription>
                        An analysis of your sales data for the selected period.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] p-1">
                    {isGenerating ? (
                         <div className="flex items-center justify-center h-full">
                            <p>Generating your report...</p>
                        </div>
                    ) : (
                        reportContent && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Trend Summary</h3>
                                    {renderMarkdown(reportContent.trendSummary)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Stock Recommendations</h3>
                                    {renderMarkdown(reportContent.stockRecommendations)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Additional Insights</h3>
                                    {renderMarkdown(reportContent.additionalInsights)}
                                </div>
                            </div>
                        )
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
