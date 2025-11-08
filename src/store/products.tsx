
import { create } from 'zustand';
import { Product, Sale } from '@/lib/types';
import { INITIAL_PRODUCTS, MOCK_SALES } from '@/lib/constants';
import { createContext, useContext, useRef, type ReactNode } from 'react';
import type { StoreApi } from 'zustand';

interface AppState {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  decreaseStock: (productId: string, quantity: number) => void;
  addSale: (sale: Sale) => void;
}

const createAppStore = () => create<AppState>((set) => ({
  products: INITIAL_PRODUCTS,
  sales: MOCK_SALES,
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (product) => set((state) => ({
    products: state.products.map((p) => (p.id === product.id ? product : p)),
  })),
  decreaseStock: (productId, quantity) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
      ),
    })),
  addSale: (sale) => set((state) => ({ sales: [sale, ...state.sales] })),
}));

const AppStoreContext = createContext<StoreApi<AppState> | null>(null);

const AppStoreProvider = ({ children }: { children: ReactNode }) => {
    const storeRef = useRef<StoreApi<AppState>>();
    if (!storeRef.current) {
        storeRef.current = createAppStore();
    }
    return (
        <AppStoreContext.Provider value={storeRef.current}>
            {children}
        </AppStoreContext.Provider>
    );
}

const useAppStore = <T,>(selector: (state: AppState) => T): T => {
    const store = useContext(AppStoreContext);
    if (!store) {
        throw new Error('useAppStore must be used within an AppStoreProvider');
    }
    return store(selector);
};

export { createAppStore as createProductStore, AppStoreProvider as ProductStoreProvider, useAppStore as useProductStore };

    