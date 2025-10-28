import type { Product, Sale } from '@/lib/types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Basmati Rice',
    description: 'Premium quality long-grain Basmati rice.',
    price: 150,
    stock: 50,
    lowStockThreshold: 10,
    category: 'Grains',
    imageUrl: 'https://picsum.photos/seed/rice1/400/300',
  },
  {
    id: 'prod_2',
    name: 'Toor Dal',
    description: 'Split pigeon peas, a staple in Indian cooking.',
    price: 120,
    stock: 45,
    lowStockThreshold: 15,
    category: 'Lentils',
    imageUrl: 'https://picsum.photos/seed/lentils1/400/300',
  },
  {
    id: 'prod_3',
    name: 'Atta Flour',
    description: 'Whole wheat flour for making rotis and chapatis.',
    price: 50,
    stock: 80,
    lowStockThreshold: 20,
    category: 'Flour',
    imageUrl: 'https://picsum.photos/seed/flour1/400/300',
  },
  {
    id: 'prod_4',
    name: 'Sunflower Oil',
    description: 'Refined sunflower oil for daily cooking.',
    price: 180,
    stock: 30,
    lowStockThreshold: 10,
    category: 'Oils',
    imageUrl: 'https://picsum.photos/seed/oil1/400/300',
  },
  {
    id: 'prod_5',
    name: 'Turmeric Powder',
    description: 'Pure Haldi powder with high curcumin content.',
    price: 40,
    stock: 100,
    lowStockThreshold: 30,
    category: 'Spices',
    imageUrl: 'https://picsum.photos/seed/spices1/400/300',
  },
  {
    id: 'prod_6',
    name: 'Cumin Seeds',
    description: 'Whole Jeera seeds for tempering and flavor.',
    price: 60,
    stock: 70,
    lowStockThreshold: 25,
    category: 'Spices',
    imageUrl: 'https://picsum.photos/seed/spices2/400/300',
  },
  {
    id: 'prod_7',
    name: 'White Sugar',
    description: 'Refined crystal sugar.',
    price: 45,
    stock: 120,
    lowStockThreshold: 40,
    category: 'Sweeteners',
    imageUrl: 'https://picsum.photos/seed/sugar1/400/300',
  },
  {
    id: 'prod_8',
    name: 'Tata Tea Gold',
    description: 'A blend of fine tea leaves for a rich taste.',
    price: 250,
    stock: 40,
    lowStockThreshold: 10,
    category: 'Beverages',
    imageUrl: 'https://picsum.photos/seed/tea1/400/300',
  },
  {
    id: 'prod_9',
    name: 'Amul Ghee',
    description: 'Pure cow ghee with a rich aroma.',
    price: 550,
    stock: 25,
    lowStockThreshold: 5,
    category: 'Dairy',
    imageUrl: 'https://picsum.photos/seed/ghee1/400/300',
  },
  {
    id: 'prod_10',
    name: 'Onions',
    description: 'Fresh red onions, 1kg.',
    price: 30,
    stock: 90,
    lowStockThreshold: 20,
    category: 'Vegetables',
    imageUrl: 'https://picsum.photos/seed/onions1/400/300',
  },
  {
    id: 'prod_11',
    name: 'Potatoes',
    description: 'Fresh farm potatoes, 1kg.',
    price: 25,
    stock: 150,
    lowStockThreshold: 30,
    category: 'Vegetables',
    imageUrl: 'https://picsum.photos/seed/potatoes1/400/300',
  },
  {
    id: 'prod_12',
    name: 'Tomatoes',
    description: 'Fresh ripe tomatoes, 1kg.',
    price: 40,
    stock: 60,
    lowStockThreshold: 15,
    category: 'Vegetables',
    imageUrl: 'https://picsum.photos/seed/tomatoes1/400/300',
  },
];


export const MOCK_SALES: Sale[] = [
    {
      id: "sale_1",
      date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
      items: [{ productId: "prod_1", quantity: 2, priceAtSale: 150 }, { productId: "prod_3", quantity: 1, priceAtSale: 50 }],
      total: 350
    },
    {
      id: "sale_2",
      date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
      items: [{ productId: "prod_10", quantity: 5, priceAtSale: 30 }, { productId: "prod_11", quantity: 5, priceAtSale: 25 }],
      total: 275
    },
    {
      id: "sale_3",
      date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      items: [{ productId: "prod_2", quantity: 3, priceAtSale: 120 }, { productId: "prod_5", quantity: 2, priceAtSale: 40 }],
      total: 440
    },
    {
      id: "sale_4",
      date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
      items: [{ productId: "prod_8", quantity: 1, priceAtSale: 250 }, { productId: "prod_7", quantity: 2, priceAtSale: 45 }],
      total: 340
    },
    {
      id: "sale_5",
      date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      items: [{ productId: "prod_1", quantity: 1, priceAtSale: 150 }, { productId: "prod_11", quantity: 10, priceAtSale: 25 }],
      total: 400
    },
    {
      id: "sale_6",
      date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
      items: [{ productId: "prod_4", quantity: 1, priceAtSale: 180 }, { productId: "prod_9", quantity: 1, priceAtSale: 550 }],
      total: 730
    },
     {
      id: "sale_7",
      date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      items: [{ productId: "prod_12", quantity: 3, priceAtSale: 40 }, { productId: "prod_6", quantity: 1, priceAtSale: 60 }],
      total: 180
    }
  ];
  
