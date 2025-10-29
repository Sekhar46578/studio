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
import { INITIAL_PRODUCTS } from "@/lib/constants";
import type { Product, SaleItem } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";

export default function SalesPage() {
  const { t } = useTranslation();
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [newSaleItems, setNewSaleItems] = useState<SaleItem[]>([]);

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
      </main>
    </div>
  );
}
