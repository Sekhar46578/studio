
"use client";

import { useState, useRef, useEffect } from "react";
import { PlusCircle, Trash2, Camera, X } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { INITIAL_PRODUCTS, MOCK_SALES } from "@/lib/constants";
import type { Product, Sale, SaleItem } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// You might need a library like 'js-barcode-scanner' or write your own logic
// For this example, we'll simulate scanning.
// In a real app, you would integrate a barcode scanning library here.
const FAKE_BARCODE_SCANNER_DELAY = 1000;

export default function SalesPage() {
  const { t } = useTranslation();
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [newSaleItems, setNewSaleItems] = useState<SaleItem[]>([]);
  const { toast } = useToast();
  
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isScannerOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // In a real app, you would start the barcode detection here.
          // For now, we simulate a scan.
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
      // Stop camera stream when scanner is closed
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isScannerOpen, toast]);
  

  const addSaleItem = (productId?: string) => {
    const productToAdd = productId 
      ? products.find(p => p.id === productId)
      : products.length > 0 ? products[0] : undefined;

    if (productToAdd) {
        // Check if item already exists in the cart
        const existingItemIndex = newSaleItems.findIndex(item => item.productId === productToAdd.id);
        if (existingItemIndex > -1) {
            // increase quantity
            updateSaleItem(existingItemIndex, 'quantity', newSaleItems[existingItemIndex].quantity + 1);
        } else {
            // add new item
            setNewSaleItems([
                ...newSaleItems,
                { productId: productToAdd.id, quantity: 1, priceAtSale: productToAdd.price },
            ]);
        }
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
    
    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
            itemToUpdate.productId = value as string;
            itemToUpdate.priceAtSale = product.price;
        }
    } else if (field === 'quantity') {
        const quantity = Number(value);
        if (quantity >= 1) {
            itemToUpdate.quantity = quantity;
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
    
    console.log("New Sale Recorded:", newSale);
    MOCK_SALES.unshift(newSale);
    
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
