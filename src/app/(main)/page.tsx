"use client";

import { useState } from "react";
import Image from "next/image";
import { PlusCircle, MinusCircle, AlertTriangle } from "lucide-react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_PRODUCTS } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const handleStockChange = (productId: string, amount: number) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + amount) } : p
      )
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.dashboard} />
      <main className="flex-1 p-4 sm:p-6">
        <h2 className="text-2xl font-bold tracking-tight mb-4">{t.inventoryOverview}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader className="pb-4">
                <div className="relative h-40 w-full mb-2">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-md object-cover"
                    data-ai-hint="product image"
                  />
                </div>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {product.stock}
                  </span>
                  <div>
                    {product.stock === 0 ? (
                      <Badge variant="destructive">{t.outOfStock}</Badge>
                    ) : product.stock <= product.lowStockThreshold ? (
                      <Badge variant="destructive" className="bg-yellow-500 text-black hover:bg-yellow-600">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {t.lowStockAlert}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{t.inStock}</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t.stock}</p>
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-between gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStockChange(product.id, -1)}
                  >
                    <MinusCircle className="mr-2 h-4 w-4" />
                    <span>-1</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStockChange(product.id, 1)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>+1</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
