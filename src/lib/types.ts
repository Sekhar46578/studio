export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
  imageUrl: string;
};

export type SaleItem = {
  productId: string;
  quantity: number;
  priceAtSale: number;
};

export type Sale = {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
};

export type User = {
  name: string;
  email: string;
};
