'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProductType } from '@/lib/productSchema';
import {
  getTotalStorageWithAggregation,
  createStorageSummary,
  calculateCartTotals,
} from '@/lib/storageUtils';
import { getApiUrl, getAdminApiUrl } from '@/lib/apiConfig';

export type Tag = { id: string; name: string; slug: string };

export type Product = {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  image?: string;
  images: string[];
  type: ProductType;
  subtype: string;
  price: number;
  oldPrice?: number;
  description?: string;
  stockCount: number;
  storageCapacity: number | null;
  gbSize: number | null;
  dataDetails: string[];
  isSale: boolean; // Show on dedicated /sale page
  isBrandActive: boolean;
  brands: string[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  selectedBrand?: string;
};

export type StorageDataMapping = {
  storageItemId: string;
  storageName: string;
  storageCapacity: number;
  assignedData: {
    dataItemId: string;
    dataName: string;
    sizeGB: number;
  }[];
};

export type Order = {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  items: Product[];
  driveItems: Product[];
  totalGb: number;
  paymentScreenshot?: string;
  createdAt: number;
  storageDataMapping?: StorageDataMapping[];
};

export type SubCategory = {
  id: string;
  name: string;
  slug: string;
};

export type Filters = {
  searchQuery: string;
  category: ProductType | 'all';
  subtype: string;
  tags: string[];
  priceRange: [number, number];
};

type CartItem = Product & { quantity?: number };

type StoreState = {
  cartItems: CartItem[];
  driveItems: CartItem[];
  orders: Order[];
  filters: Filters;
  products: Product[];
  productsLoading: boolean;
  tags: Tag[];
  availableSubCategories: SubCategory[];
  isAuthenticated: boolean;
  token: string | null;
};

type StoreActions = {
  setSearchQuery: (query: string) => void;
  setCategory: (category: Filters['category']) => void;
  setSubtype: (subtype: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setPriceRange: (priceRange: [number, number]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  addToDrive: (product: Product) => { ok: boolean; reason?: string };
  removeFromDrive: (id: string) => void;
  clearCart: () => void;
  clearDrive: () => void;
  placeOrder: (paymentScreenshot?: string | File | null) => Promise<Order>;
  markOrderCompleted: (id: string) => void;
  removeOrder: (id: string) => void;
  setProducts: (products: Product[]) => void;
  setProductsLoading: (loading: boolean) => void;
  setTags: (tags: Tag[]) => void;
  fetchProducts: (params?: {
    searchQuery?: string;
    category?: string;
    subtype?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
  }) => Promise<void>;
  fetchTags: () => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getFilteredProducts: () => Product[];
  getTotalCartPrice: () => number;
  getTotalDriveCapacity: () => number;
  getStorageAggregation: () => ReturnType<typeof getTotalStorageWithAggregation>;
  getStorageSummary: () => string;
};

function _getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useStore = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      cartItems: [],
      driveItems: [],
      orders: [],
      filters: { searchQuery: '', category: 'all', subtype: '', tags: [], priceRange: [0, 50000] },
      products: [],
      productsLoading: false,
      tags: [],
      availableSubCategories: [],
      isAuthenticated: false,
      token: null,

      setSearchQuery: (query) => {
        set((state) => ({ filters: { ...state.filters, searchQuery: query } }));
        get().fetchProducts({
          searchQuery: query,
          category: get().filters.category,
          tags: get().filters.tags,
        });
      },

      setCategory: (category) => {
        set((state) => ({ filters: { ...state.filters, category, subtype: '' } }));
        get().fetchProducts({
          searchQuery: get().filters.searchQuery,
          category,
          tags: get().filters.tags,
        });
      },

      setSubtype: (subtype) => {
        set((state) => ({ filters: { ...state.filters, subtype } }));
        get().fetchProducts({
          searchQuery: get().filters.searchQuery,
          category: get().filters.category,
          subtype,
          tags: get().filters.tags,
          minPrice: get().filters.priceRange[0],
          maxPrice: get().filters.priceRange[1],
        });
      },

      toggleTag: (tag) => {
        const current = get().filters.tags;
        const tags = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
        set((state) => ({ filters: { ...state.filters, tags } }));
        get().fetchProducts({
          searchQuery: get().filters.searchQuery,
          category: get().filters.category,
          tags,
        });
      },

      setPriceRange: (priceRange: [number, number]) => {
        set((state) => ({ filters: { ...state.filters, priceRange } }));
        get().fetchProducts({
          searchQuery: get().filters.searchQuery,
          category: get().filters.category,
          tags: get().filters.tags,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        });
      },

      clearTags: () => {
        set((state) => ({
          filters: { ...state.filters, tags: [], subtype: '', priceRange: [0, 50000] },
        }));
        get().fetchProducts({
          searchQuery: get().filters.searchQuery,
          category: get().filters.category,
          tags: [],
          minPrice: 0,
          maxPrice: 50000,
        });
      },

      addToCart: (product) => {
        // Check if product requires brand selection but no brand is selected
        if (
          product.isBrandActive &&
          product.brands &&
          product.brands.length > 0 &&
          !product.selectedBrand &&
          product.type !== 'data'
        ) {
          throw new Error('يرجى اختيار الماركة قبل إضافة المنتج للسلة');
        }

        // For storage products, check for existing items with same model and storage capacity
        if (product.type === 'storage') {
          const existing = get().cartItems.find(
            (p) =>
              p.id === product.id &&
              (p.selectedBrand || '') === (product.selectedBrand || '') &&
              p.storageCapacity === product.storageCapacity
          );

          if (existing) {
            set((state) => ({
              cartItems: state.cartItems.map((p) =>
                p.id === product.id &&
                (p.selectedBrand || '') === (product.selectedBrand || '') &&
                p.storageCapacity === product.storageCapacity
                  ? { ...p, quantity: (p.quantity || 1) + 1 }
                  : p
              ),
            }));
            return;
          }
        } else {
          // For non-storage products, use existing logic
          const existing = get().cartItems.find(
            (p) => p.id === product.id && (p.selectedBrand || '') === (product.selectedBrand || '')
          );

          if (existing) {
            set((state) => ({
              cartItems: state.cartItems.map((p) =>
                p.id === product.id && (p.selectedBrand || '') === (product.selectedBrand || '')
                  ? { ...p, quantity: (p.quantity || 1) + 1 }
                  : p
              ),
            }));
            return;
          }
        }

        // Add new item if no existing match found
        set((state) => ({ cartItems: [...state.cartItems, { ...product, quantity: 1 }] }));
      },

      removeFromCart: (id) => {
        set((state) => ({ cartItems: state.cartItems.filter((p) => p.id !== id) }));
      },

      updateCartQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        set((state) => ({
          cartItems: state.cartItems.map((p) => (p.id === id ? { ...p, quantity } : p)),
        }));
      },

      addToDrive: (product) => {
        const capacityGB = get()
          .cartItems.filter((p) => p.type === 'storage')
          .reduce((acc, p) => acc + (p.storageCapacity || 0) * ((p as any).quantity || 1), 0);
        const usedGB = get().driveItems.reduce(
          (acc, p) => acc + (p.storageCapacity || 0) * ((p as any).quantity || 1),
          0
        );
        const nextSize = product.storageCapacity || 0;
        if (capacityGB > 0 && usedGB + nextSize > capacityGB) {
          return { ok: false, reason: 'EXCEEDED_CAPACITY' };
        }
        set((state) => ({ driveItems: [...state.driveItems, { ...product, quantity: 1 }] }));
        return { ok: true };
      },

      removeFromDrive: (id) => {
        set((state) => ({ driveItems: state.driveItems.filter((p) => p.id !== id) }));
      },

      clearCart: () => set({ cartItems: [] }),
      clearDrive: () => set({ driveItems: [] }),

      placeOrder: async (paymentScreenshot) => {
        const state = get();
        const allStorageItems = [...state.cartItems, ...state.driveItems];
        const totalGb = allStorageItems
          .filter((p) => p.type === 'storage')
          .reduce((acc, p) => acc + (p.storageCapacity || 0), 0);
        const capacityGB = state.cartItems
          .filter((p) => p.type === 'storage')
          .reduce((acc, p) => acc + (p.storageCapacity || 0), 0);
        const totalPrice = calculateCartTotals(state.cartItems).total;
        const order: Order = {
          id: `AK-${Math.floor(Math.random() * 90000) + 10000}`,
          status: 'pending',
          items: state.cartItems,
          driveItems: state.driveItems,
          totalGb,
          paymentScreenshot: typeof paymentScreenshot === 'string' ? paymentScreenshot : undefined,
          createdAt: Date.now(),
        };
        const form = new FormData();
        form.set('orderID', order.id);
        form.set('customerDetails', JSON.stringify({ source: 'checkout' }));
        form.set(
          'items',
          JSON.stringify(
            state.cartItems.map((p) => ({
              name: p.name,
              price: p.price,
              quantity: p.quantity || 1,
            }))
          )
        );
        form.set(
          'driveItems',
          JSON.stringify(
            state.driveItems.map((p) => ({
              name: p.name,
              sizeGB: p.storageCapacity || 0,
              category: p.type,
            }))
          )
        );
        form.set('totalPrice', String(totalPrice));
        form.set('capacityGB', String(capacityGB || 0));
        if (paymentScreenshot instanceof File) {
          form.set('paymentScreenshot', paymentScreenshot);
        } else if (typeof paymentScreenshot === 'string') {
          form.set('paymentScreenshotUrl', paymentScreenshot);
        }
        const res = await fetch(getApiUrl('orders'), { method: 'POST', body: form });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || data?.message || 'Failed to create order');
        }
        set((state) => ({ orders: [order, ...state.orders], cartItems: [], driveItems: [] }));
        return order;
      },

      markOrderCompleted: (id) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: 'completed' } : o)),
        }));
      },

      removeOrder: (id) => {
        set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
      },

      setProducts: (products) => set({ products }),
      setProductsLoading: (loading) => set({ productsLoading: loading }),
      setTags: (tags) => set({ tags }),

      fetchTags: async () => {
        try {
          const res = await fetch(getApiUrl('tags'), { cache: 'no-store' });
          if (!res.ok) throw new Error('Failed to fetch tags');

          const data = await res.json();
          set({ tags: data.tags || [] });
        } catch (error) {
          console.error('Error fetching tags:', error);
          set({ tags: [] });
        }
      },

      fetchProducts: async (params) => {
        set({ productsLoading: true });
        try {
          const searchParams = new URLSearchParams();
          if (params?.searchQuery) searchParams.set('search', params.searchQuery);
          if (params?.category && params.category !== 'all')
            searchParams.set('category', params.category);
          if (params?.subtype) searchParams.set('subtype', params.subtype);
          if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
          if (params?.minPrice !== undefined) searchParams.set('minPrice', String(params.minPrice));
          if (params?.maxPrice !== undefined) searchParams.set('maxPrice', String(params.maxPrice));

          // Use the backend API directly
          const baseUrl = getApiUrl('products');
          const url = `${baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) throw new Error('Failed to fetch products');

          const data = await res.json();
          console.info('Fetched products:', data.products?.length || 0, 'products');

          set({
            products: data.products || [],
            availableSubCategories: data.availableSubCategories || [],
          });
        } catch (error) {
          console.error('Error fetching products:', error);
          set({ products: [] });
        } finally {
          set({ productsLoading: false });
        }
      },

      createProduct: async (product) => {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
          console.info('Sending product to API:', product);
          const res = await fetch(getAdminApiUrl('products'), {
            method: 'POST',
            headers,
            body: JSON.stringify(product),
          });
          console.info('Response status:', res.status);
          console.info('Response ok:', res.ok);

          if (!res.ok) {
            const data = await res.json();
            console.error('API error response:', data);
            throw new Error(data.error || 'Failed to create product');
          }
          const data = await res.json();
          console.info('Product created successfully:', data);
          // Refresh products list to get the latest data
          await get().fetchProducts();
          return data.product;
        } catch (error) {
          console.error('Create product error:', error);
          throw error;
        }
      },

      updateProduct: async (id, product) => {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
          const res = await fetch(getAdminApiUrl(`products/${id}`), {
            method: 'PUT',
            headers,
            body: JSON.stringify(product),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to update product');
          }
          const data = await res.json();
          // Refresh products list to get the latest data
          await get().fetchProducts();
          return data.product;
        } catch (error) {
          console.error('Update product error:', error);
          throw error;
        }
      },

      deleteProduct: async (id) => {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
          const res = await fetch(getAdminApiUrl(`products/${id}`), {
            method: 'DELETE',
            headers,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete product');
          }

          // Refresh products list to get the latest data
          await get().fetchProducts();
        } catch (error) {
          console.error('Delete product error:', error);
          throw error;
        }
      },

      login: async (username, password) => {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.token) {
          throw new Error(data.error || 'Invalid credentials');
        }
        setCookie('admin_session', data.token, 7);
        set({ isAuthenticated: true, token: data.token });
        return true;
      },

      logout: () => {
        deleteCookie('admin_session');
        set({ isAuthenticated: false, token: null });
      },

      getFilteredProducts: () => {
        const { products, filters } = get();
        const q = filters.searchQuery.trim().toLowerCase();
        return products.filter((p) => {
          if (filters.category !== 'all' && p.type !== filters.category) return false;
          if (q) {
            const hay = `${p.name} ${p.subtype} ${p.description || ''}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          if (filters.tags.length > 0) {
            const tagSlugs = p.tags.map((t) => t.slug);
            if (!filters.tags.some((t) => tagSlugs.includes(t))) return false;
          }
          if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
          return true;
        });
      },

      getTotalCartPrice: () => {
        return calculateCartTotals(get().cartItems).total;
      },

      getTotalDriveCapacity: () => {
        const allItems = [...get().cartItems, ...get().driveItems];
        return allItems
          .filter((p) => p.type === 'storage')
          .reduce((acc, p) => acc + (p.storageCapacity || 0) * ((p as any).quantity || 1), 0);
      },

      getStorageAggregation: () => {
        const allItems = [...get().cartItems, ...get().driveItems];
        return getTotalStorageWithAggregation(allItems);
      },

      getStorageSummary: () => {
        const allItems = [...get().cartItems, ...get().driveItems];
        const { aggregations } = getTotalStorageWithAggregation(allItems);
        return createStorageSummary(aggregations);
      },
    }),
    {
      name: 'abo-kartona-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        driveItems: state.driveItems,
        orders: state.orders,
      }),
    }
  )
);
