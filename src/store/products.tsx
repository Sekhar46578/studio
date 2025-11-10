
import { create, useStore } from 'zustand';
import type { User } from 'firebase/auth';
import { createContext, useContext, useRef, type ReactNode, useEffect, useState } from 'react';
import type { StoreApi } from 'zustand';
import {
  collection,
  doc,
  writeBatch,
  getDocs,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import { useFirebase } from '@/firebase';

import { Product, Sale } from '@/lib/types';
import { INITIAL_PRODUCTS, MOCK_SALES } from '@/lib/constants';

import { 
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking
} from '@/firebase/non-blocking-updates';

interface AppState {
  products: Product[];
  sales: Sale[];
  init: (products: Product[], sales: Sale[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
}

const createAppStore = (userId: string, firestore: any) => {
  const productsCollection = collection(firestore, 'users', userId, 'products');
  const salesCollection = collection(firestore, 'users', userId, 'sales');

  return create<AppState>((set, get) => ({
    products: [],
    sales: [],
    init: (products, sales) => set({ products, sales }),
    addProduct: (product) => {
      const newProduct = { ...product, stock: Number(product.stock) || 0 };
      addDocumentNonBlocking(productsCollection, newProduct).then(docRef => {
          if (docRef) {
              set((state) => ({ products: [{...newProduct, id: docRef.id}, ...state.products] }));
          }
      });
    },
    updateProduct: (product) => {
      const productRef = doc(firestore, 'users', userId, 'products', product.id);
      updateDocumentNonBlocking(productRef, product);
      set((state) => ({
        products: state.products.map((p) => (p.id === product.id ? product : p)),
      }));
    },
    deleteProduct: (productId) => {
      const productRef = doc(firestore, 'users', userId, 'products', productId);
      deleteDocumentNonBlocking(productRef);
      set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
      }));
    },
    addSale: (sale) => {
      const newSale = {
        ...sale,
        date: new Date().toISOString(),
        total: sale.items.reduce((acc, item) => acc + item.priceAtSale * item.quantity, 0)
      };

      addDocumentNonBlocking(salesCollection, newSale).then(docRef => {
        if(docRef) {
          set((state) => ({ sales: [{...newSale, id: docRef.id}, ...state.sales] }));
        }
      });

      const batch = writeBatch(firestore);
      const currentProducts = get().products;

      sale.items.forEach(item => {
        const product = currentProducts.find(p => p.id === item.productId);
        if (product) {
          const productRef = doc(firestore, 'users', userId, 'products', item.productId);
          const newStock = Math.max(0, product.stock - item.quantity);
          batch.update(productRef, { stock: newStock });
        }
      });
      batch.commit().catch(console.error);
       set(state => ({
          products: state.products.map(p => {
              const saleItem = sale.items.find(item => item.productId === p.id);
              if (saleItem) {
                  return { ...p, stock: Math.max(0, p.stock - saleItem.quantity) };
              }
              return p;
          })
      }));
    },
  }));
};

const AppStoreContext = createContext<StoreApi<AppState> | null>(null);

export const ProductStoreProvider = ({ children, user }: { children: ReactNode; user: User | null }) => {
  const { firestore } = useFirebase();
  const storeRef = useRef<StoreApi<AppState>>();
  const userKey = user?.uid || 'guest';

  // Keep a map of stores for each user
  const [stores, setStores] = useState(new Map<string, StoreApi<AppState>>());

  useEffect(() => {
    if (!user || !firestore) {
      storeRef.current = undefined;
      return;
    };

    if (!stores.has(userKey)) {
      const newStore = createAppStore(user.uid, firestore);
      
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(userDoc => {
          if (!userDoc.exists()) {
              // New user, seed initial data
              const productsCollection = collection(firestore, 'users', user.uid, 'products');
              const batch = writeBatch(firestore);
              INITIAL_PRODUCTS.forEach(product => {
                  const newDocRef = doc(productsCollection);
                  batch.set(newDocRef, product);
              });
              batch.commit().then(() => {
                  newStore.getState().init(INITIAL_PRODUCTS, []);
              });
              setDocumentNonBlocking(userDocRef, { initialized: true }, { merge: true });
          } else {
              // Existing user, load their data
              const productsQuery = collection(firestore, 'users', user.uid, 'products');
              const salesQuery = collection(firestore, 'users', user.uid, 'sales');

              Promise.all([
                  getDocs(productsQuery),
                  getDocs(salesQuery)
              ]).then(([productsSnapshot, salesSnapshot]) => {
                  const products = productsSnapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Product[];
                  const sales = salesSnapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Sale[];
                  newStore.getState().init(products, sales);
              });
          }
      });
      
      setStores(prevStores => new Map(prevStores).set(userKey, newStore));
      storeRef.current = newStore;
    } else {
        storeRef.current = stores.get(userKey);
    }
  }, [user, firestore, userKey, stores]);
  
  if (!user) {
    return <>{children}</>
  }

  if (!storeRef.current) {
     return (
       <div className="flex items-center justify-center h-screen">
          <p>Loading data...</p>
        </div>
     );
  }

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  );
};


export const useProductStore = <T>(selector: (state: AppState) => T): T => {
    const store = useContext(AppStoreContext);
    if (!store) {
        throw new Error('useProductStore must be used within a AppStoreProvider');
    }
    return useStore(store, selector);
};
