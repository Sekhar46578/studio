"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { INITIAL_PRODUCTS } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";
import Image from "next/image";

export default function InventoryPage() {
  const { t } = useTranslation();
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  const getStockStatus = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">{t.outOfStock}</Badge>;
    }
    if (stock < lowStockThreshold) {
      return <Badge variant="destructive" className="bg-yellow-500 text-black">{t.lowStockAlert}</Badge>;
    }
    return <Badge variant="secondary">{t.inStock}</Badge>;
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.inventoryOverview} />
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.inventoryOverview}</CardTitle>
            <CardDescription>
              Monitor your product stock levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>{t.productName}</TableHead>
                  <TableHead>{t.stock}</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                     <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.imageUrl}
                        width="64"
                        data-ai-hint="product image"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{getStockStatus(product.stock, product.lowStockThreshold)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
