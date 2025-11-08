
import { create, useStore } from 'zustand';
import { Product, Sale } from '@/lib/types';
import { INITIAL_PRODUCTS, MOCK_SALES } from '@/lib/constants';
import { createContext, useContext, useRef, type ReactNode, useEffect, useState } from 'react';
import type { StoreApi } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  decreaseStock: (productId: string, quantity: number) => void;
  addSale: (sale: Sale) => void;
}

const createAppStore = () => create(
  persist<AppState>(
    (set) => ({
      products: INITIAL_PRODUCTS,
      sales: MOCK_SALES,
      addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
      updateProduct: (product) => set((state) => ({
        products: state.products.map((p) => (p.id === product.id ? product : p)),
      })),
      deleteProduct: (productId) => set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
      })),
      decreaseStock: (productId, quantity) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
          ),
        })),
      addSale: (sale) => set((state) => ({ sales: [sale, ...state.sales] })),
    }),
    {
      name: 'shopstock-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

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

const useProductStore = <T,>(selector?: (state: AppState) => T): T | AppState => {
    const store = useContext(AppStoreContext);
    if (!store) {
        throw new Error('useProductStore must be used within an AppStoreProvider');
    }
    // This part is crucial for handling hydration issues with Zustand and Next.js
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);

    const state = useStore(store, selector || ((s) => s));
    
    if (!hydrated) {
        const initialState = createAppStore().getState();
        return selector ? selector(initialState) : initialState;
    }

    return state;
};

export { createAppStore as createProductStore, AppStoreProvider as ProductStoreProvider, useProductStore };
