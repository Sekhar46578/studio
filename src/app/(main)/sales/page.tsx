"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Header } from "@/components/header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { INITIAL_PRODUCTS, MOCK_SALES } from "@/lib/constants";
import type { Product, Sale, SaleItem } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";
import { cn } from "@/lib/utils";

export default function SalesPage() {
  const { t } = useTranslation();
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales] = useState<Sale[]>(MOCK_SALES);
  const [newSaleItems, setNewSaleItems] = useState<SaleItem[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const addSaleItem = () => {
    if (products.length > 0) {
      setNewSaleItems([
        ...newSaleItems,
        { productId: products[0].id, quantity: 1, priceAtSale: products[0].price },
      ]);
    }
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const items = [...newSaleItems];
    const product = products.find(p => p.id === (field === 'productId' ? value : items[index].productId));
    if (field === 'productId' && product) {
      items[index] = { ...items[index], productId: value as string, priceAtSale: product.price };
    } else {
      items[index] = { ...items[index], [field]: Number(value) };
    }
    setNewSaleItems(items);
  };
  
  const removeSaleItem = (index: number) => {
    setNewSaleItems(newSaleItems.filter((_, i) => i !== index));
  }

  const newSaleTotal = newSaleItems.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + (product ? item.quantity * product.price : 0);
  }, 0);

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    if(date?.from && date?.to){
        return saleDate >= date.from && saleDate <= date.to;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.sales} />
      <main className="flex-1 p-4 sm:p-6">
        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">{t.salesHistory}</TabsTrigger>
            <TabsTrigger value="record">{t.recordSale}</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t.salesHistory}</CardTitle>
                <CardDescription>
                  Review your past sales transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="mb-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[300px] justify-start text-left font-normal",
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
                      <PopoverContent className="w-auto p-0" align="start">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.date}</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead className="text-right">{t.total}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.date), "PPP")}</TableCell>
                        <TableCell>
                          {sale.items.map(item => {
                            const product = products.find(p => p.id === item.productId);
                            return <div key={item.productId}>{product?.name || 'Unknown'} x {item.quantity}</div>
                          })}
                        </TableCell>
                        <TableCell className="text-right">₹{sale.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="record">
            <Card>
              <CardHeader>
                <CardTitle>{t.recordSale}</CardTitle>
                <CardDescription>
                  Add products to record a new sales transaction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newSaleItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Select
                        value={item.productId}
                        onValueChange={(value) => updateSaleItem(index, 'productId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateSaleItem(index, 'quantity', e.target.value)}
                        className="w-24"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeSaleItem(index)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addSaleItem} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t.addToSale}
                  </Button>
                  <div className="flex justify-end items-center pt-4 border-t">
                     <span className="text-lg font-semibold mr-4">{t.total}: ₹{newSaleTotal.toFixed(2)}</span>
                    <Button>{t.submitSale}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
