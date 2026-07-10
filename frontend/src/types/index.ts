import type { ProductType } from '@/lib/productSchema';

export type Tag = { id: string; name: string; slug: string };

// Standalone Product interface (compatible with store type)
export interface Product {
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
  isSale: boolean;
  isBrandActive: boolean;
  brands: string[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  selectedBrand?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterState {
  priceRange: [number, number];
  ram: string[];
  storage: string[];
  brands: string[];
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  isPositive: boolean;
  icon: string;
}

export interface SalesData {
  day: string;
  sales: number;
  orders: number;
}

export type ThemeMode = 'normal' | 'ramadan' | 'eid' | 'christmas';
