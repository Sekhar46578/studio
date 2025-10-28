"use client";

import { useState } from "react";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_PRODUCTS } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";
import Image from "next/image";

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isDialogOpen, setDialogOpen] = useState(false);

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
      imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300`,
    };
    setProducts([newProduct, ...products]);
    setDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.products} />
      <main className="flex-1 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t.productManagement}</CardTitle>
                <CardDescription>
                  Manage your products and view their inventory.
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
                      Add details for the new product.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct}>
                    <div className="grid gap-4 py-4">
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
                    </div>
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
                  <TableHead className="hidden md:table-cell">{t.price}</TableHead>
                  <TableHead className="hidden md:table-cell">{t.category}</TableHead>
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
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="hidden md:table-cell">₹{product.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.category}</TableCell>
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
