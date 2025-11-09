
import { create, useStore } from 'zustand';
import { Product, Sale, User } from '@/lib/types';
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

const createAppStore = (user: User | null) => {
  const storageName = user ? `shopstock-storage-${user.email}` : 'shopstock-storage-guest';
  
  return create(
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
        name: storageName,
        storage: createJSONStorage(() => localStorage), 
        // When a new user signs up, give them default products but empty sales.
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.log('an error happened during hydration', error)
          } else {
            const isNewUser = user && !localStorage.getItem(storageName);
            if (isNewUser && state) {
              state.sales = [];
            }
          }
        },
      }
    )
  );
};


const AppStoreContext = createContext<StoreApi<AppState> | null>(null);

const ProductStoreProvider = ({ children, user }: { children: ReactNode, user: User | null }) => {
    const storeRef = useRef<StoreApi<AppState>>();
    
    // Create a new store whenever the user changes
    if (!storeRef.current || storeRef.current.getState().products !== createAppStore(user).getState().products) {
        storeRef.current = createAppStore(user);
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
        const initialState = store.getState();
        if(selector){
            return selector(initialState);
        }
        return initialState;
    }

    return state;
};

export { createAppStore as createProductStore, ProductStoreProvider, useProductStore };
