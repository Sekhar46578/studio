
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
import type { Product } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";
import Image from "next/image";
import { useProductStore } from "@/store/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InventoryPage() {
  const { t } = useTranslation();
  const products = useProductStore((state) => state.products);
  const addProduct = useProductStore((state) => state.addProduct);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const getStockStatus = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">{t.outOfStock}</Badge>;
    }
    if (stock < lowStockThreshold) {
      return <Badge variant="destructive" className="bg-yellow-500 text-black">{t.lowStockAlert}</Badge>;
    }
    return <Badge variant="secondary">{t.inStock}</Badge>;
  };

  const handleAddProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      lowStockThreshold: Number(formData.get("lowStockThreshold")),
      category: formData.get("category") as string,
      barcode: formData.get("barcode") as string,
      imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300`,
      unit: formData.get("unit") as string,
    };
    addProduct(newProduct);
    setDialogOpen(false);
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.inventory} />
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t.inventoryOverview}</CardTitle>
                <CardDescription>
                  Monitor and manage your product stock levels.
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      {t.addNewProduct}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.addNewProduct}</DialogTitle>
                    <DialogDescription>
                      Fill in the details to add a new product to your inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct}>
                    <ScrollArea className="h-[60vh] sm:h-auto">
                      <div className="grid gap-4 py-4 px-2">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">{t.productName}</Label>
                          <Input id="name" name="name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">{t.productDescription}</Label>
                          <Input id="description" name="description" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="price" className="text-right">{t.price}</Label>
                          <Input id="price" name="price" type="number" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="stock" className="text-right">{t.initialStock}</Label>
                          <Input id="stock" name="stock" type="number" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="lowStockThreshold" className="text-right">{t.lowStockThreshold}</Label>
                          <Input id="lowStockThreshold" name="lowStockThreshold" type="number" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="category" className="text-right">{t.category}</Label>
                          <Input id="category" name="category" className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="barcode" className="text-right">Barcode</Label>
                          <Input id="barcode" name="barcode" className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="unit" className="text-right">Unit</Label>
                          <Input id="unit" name="unit" placeholder="e.g., kg, liter, piece" className="col-span-3" />
                        </div>
                      </div>
                    </ScrollArea>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
                      <Button type="submit">{t.save}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>{t.productName}</TableHead>
                  <TableHead>{t.stock}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">{t.price}</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
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
                    <TableCell>{product.stock} {product.unit}</TableCell>
                    <TableCell>{getStockStatus(product.stock, product.lowStockThreshold)}</TableCell>
                    <TableCell className="hidden md:table-cell">₹{product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
