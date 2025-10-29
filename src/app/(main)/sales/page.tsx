"use client";

import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_PRODUCTS, MOCK_SALES } from "@/lib/constants";
import type { Product, Sale, SaleItem } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";

export default function SalesPage() {
  const { t } = useTranslation();
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [newSaleItems, setNewSaleItems] = useState<SaleItem[]>([]);
  const { toast } = useToast();

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
    } else if (field === 'quantity') {
        const quantity = Number(value);
        if(quantity > 0) {
            items[index] = { ...items[index], [field]: quantity };
        }
    }
    setNewSaleItems(items);
  };
  
  const removeSaleItem = (index: number) => {
    setNewSaleItems(newSaleItems.filter((_, i) => i !== index));
  }

  const newSaleTotal = newSaleItems.reduce((acc, item) => {
    return acc + (item.quantity * item.priceAtSale);
  }, 0);

  const handleSubmitSale = () => {
    if (newSaleItems.length === 0) {
        toast({
            variant: "destructive",
            title: "Cannot record sale",
            description: "Please add items to the sale.",
        });
        return;
    }

    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      date: new Date().toISOString(),
      items: newSaleItems,
      total: newSaleTotal,
    };
    
    // In a real app, you'd send this to a server/database.
    // For now, we'll just log it and add to mock data.
    console.log("New Sale Recorded:", newSale);
    MOCK_SALES.push(newSale);
    
    toast({
      title: "Sale Recorded",
      description: `Sale of ₹${newSaleTotal.toFixed(2)} has been successfully recorded.`,
    });

    setNewSaleItems([]);
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.recordSale} />
      <main className="flex-1 p-4 sm:p-6">
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
                <div key={index} className="flex items-center gap-2 sm:gap-4">
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
                    className="w-20 sm:w-24"
                    />
                     <span>x ₹{item.priceAtSale.toFixed(2)}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeSaleItem(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                ))}
                <Button variant="outline" onClick={addSaleItem} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t.addToSale}
                </Button>
                <div className="flex flex-col sm:flex-row justify-end items-center pt-4 border-t gap-4">
                    <span className="text-lg font-semibold">{t.total}: ₹{newSaleTotal.toFixed(2)}</span>
                    <Button onClick={handleSubmitSale} className="w-full sm:w-auto">{t.submitSale}</Button>
                </div>
            </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
