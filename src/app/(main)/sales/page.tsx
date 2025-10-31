
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Minus, PlusCircle, Trash2, Camera, Check, ChevronsUpDown } from "lucide-react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Sale, SaleItem } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useProductStore } from "@/store/products";
import { cn } from "@/lib/utils";

const FAKE_BARCODE_SCANNER_DELAY = 1000;

export default function SalesPage() {
  const { t } = useTranslation();
  const products = useProductStore((state) => state.products);
  const decreaseStock = useProductStore((state) => state.decreaseStock);
  const addSale = useProductStore((state) => state.addSale);
  const [newSaleItems, setNewSaleItems] = useState<SaleItem[]>([]);
  const { toast } = useToast();
  
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sortedProducts = useMemo(() => 
    [...products].sort((a, b) => a.name.localeCompare(b.name)),
  [products]);

  useEffect(() => {
    if (isScannerOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setTimeout(() => {
             handleBarcodeScan("8901234567890");
          }, FAKE_BARCODE_SCANNER_DELAY * 2);

        } catch (error) {
          console.error("Error accessing camera:", error);
          setHasCameraPermission(false);
          toast({
            variant: "destructive",
            title: "Camera Access Denied",
            description: "Please enable camera permissions in your browser settings to use the scanner.",
          });
          setScannerOpen(false);
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isScannerOpen, toast]);
  

  const addSaleItem = (productId?: string) => {
    const availableProducts = sortedProducts.filter(
      p => !newSaleItems.some(item => item.productId === p.id) && p.stock > 0
    );

    const productToAdd = productId
      ? products.find(p => p.id === productId)
      : availableProducts.length > 0 ? availableProducts[0] : undefined;


    if (productToAdd) {
        if(productToAdd.stock === 0) {
            toast({
                variant: "destructive",
                title: "Out of Stock",
                description: `${productToAdd.name} is out of stock.`,
            });
            return;
        }
        const existingItemIndex = newSaleItems.findIndex(item => item.productId === productToAdd.id);
        if (existingItemIndex > -1) {
            const items = [...newSaleItems];
            const currentItem = items[existingItemIndex];
            if(currentItem.quantity < productToAdd.stock) {
                updateSaleItem(existingItemIndex, 'quantity', currentItem.quantity + 1);
            } else {
                 toast({
                    variant: "destructive",
                    title: "Stock limit reached",
                    description: `You cannot add more ${productToAdd.name} than available in stock.`,
                });
            }
        } else {
            setNewSaleItems([
                ...newSaleItems,
                { productId: productToAdd.id, quantity: 1, priceAtSale: productToAdd.price },
            ]);
        }
    } else if (!productId) {
      toast({
        variant: "destructive",
        title: "No more products to add",
        description: "You have added all available products.",
      });
    }
  };

  const handleBarcodeScan = (scannedBarcode: string) => {
    const product = products.find(p => p.barcode === scannedBarcode);
    if (product) {
      addSaleItem(product.id);
      toast({
        title: "Product Added",
        description: `${product.name} was added to the sale.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Product Not Found",
        description: "No product matches the scanned barcode.",
      });
    }
     setScannerOpen(false);
  };


  const updateSaleItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const items = [...newSaleItems];
    const itemToUpdate = { ...items[index] };
    const product = products.find(p => p.id === itemToUpdate.productId);
    
    if (field === 'productId') {
        const newProduct = products.find(p => p.id === value);
        if (newProduct) {
            itemToUpdate.productId = value as string;
            itemToUpdate.priceAtSale = newProduct.price;
            itemToUpdate.quantity = 1;
        }
    } else if (field === 'quantity') {
        const quantity = Number(value);
        if (quantity >= 0 && product && quantity <= product.stock) {
            if(quantity === 0) {
                removeSaleItem(index);
                return;
            }
            itemToUpdate.quantity = quantity;
        } else if (product && quantity > product.stock) {
            toast({
                variant: "destructive",
                title: "Stock limit reached",
                description: `You cannot add more ${product.name} than available in stock.`,
            });
            itemToUpdate.quantity = product.stock;
        }
    }

    items[index] = itemToUpdate;
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
            description: "Please add items to the sale first.",
        });
        return;
    }

    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      date: new Date().toISOString(),
      items: newSaleItems,
      total: newSaleTotal,
    };
    
    newSaleItems.forEach(item => {
        decreaseStock(item.productId, item.quantity);
    });

    addSale(newSale);
    
    toast({
      title: "Sale Recorded!",
      description: `Your sale of ₹${newSaleTotal.toFixed(2)} has been saved.`,
    });

    setNewSaleItems([]);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title={t.recordSale} />
      <main className="flex-1 p-4 sm:p-6">
        <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>{t.recordSale}</CardTitle>
                  <CardDescription>
                      Add products to create a new sale.
                  </CardDescription>
                </div>
                <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Camera className="mr-2 h-4 w-4" />
                      Scan Barcode
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Barcode Scanner</DialogTitle>
                    </DialogHeader>
                    <div className="relative">
                      <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                      {hasCameraPermission === false && (
                         <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                              Please allow camera access to use this feature.
                            </AlertDescription>
                        </Alert>
                      )}
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3/4 h-1/3 border-2 border-red-500 rounded-md" />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {newSaleItems.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  const [popoverOpen, setPopoverOpen] = useState(false);
                  return (
                    <div key={index} className="flex items-center gap-2 sm:gap-4">
                       <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={popoverOpen}
                            className="w-[250px] justify-between"
                          >
                            {item.productId
                              ? sortedProducts.find((p) => p.id === item.productId)?.name
                              : "Select a product"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                          <Command>
                            <CommandInput placeholder="Search product..." />
                            <CommandList>
                              <CommandEmpty>No product found.</CommandEmpty>
                              <CommandGroup>
                                {sortedProducts.map((p) => (
                                  <CommandItem
                                    key={p.id}
                                    value={p.name}
                                    disabled={p.stock === 0 || (newSaleItems.some(i => i.productId === p.id) && item.productId !== p.id)}
                                    onSelect={() => {
                                      updateSaleItem(index, 'productId', p.id);
                                      setPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        item.productId === p.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {p.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateSaleItem(index, 'quantity', item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateSaleItem(index, 'quantity', e.target.value)}
                          className="w-16 text-center"
                        />
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateSaleItem(index, 'quantity', item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <span className="w-24 text-right">x ₹{item.priceAtSale.toFixed(2)}</span>
                      {product?.unit && <span className="w-12 text-muted-foreground">{product.unit}</span>}
                      <Button variant="ghost" size="icon" onClick={() => removeSaleItem(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })}
                <Button variant="outline" onClick={() => addSaleItem()} className="w-full">
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
