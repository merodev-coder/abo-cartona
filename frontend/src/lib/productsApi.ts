import type { ProductType } from '@/lib/productSchema';
import { getApiUrl, getAdminApiUrl } from './apiConfig';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export type Product = {
  id: string;
  name: string;
  type: ProductType;
  subtype: string;
  price: number;
  image: string;
  stockCount: number;
  storageCapacity: number | null;
  gbSize: number | null;
  isSale: boolean;
  tags: { id: string; name: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
};

export async function fetchProducts(params?: {
  searchQuery?: string;
  category?: ProductType | 'all';
  tags?: string[];
  isSale?: boolean;
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.searchQuery) {
    searchParams.set('search', params.searchQuery);
  }
  if (params?.category && params.category !== 'all') {
    searchParams.set('category', params.category);
  }
  if (params?.tags?.length) {
    searchParams.set('tags', params.tags.join(','));
  }
  if (typeof params?.isSale !== 'undefined') {
    searchParams.set('isSale', String(params.isSale));
  }
  const baseUrl = getApiUrl('products');
  const url = `${baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load products');
  const data: unknown = await res.json();
  const products = (data as { products?: Product[] }).products;
  return Array.isArray(products) ? products : [];
}

export async function createProduct(input: {
  name: string;
  type: ProductType;
  subtype: string;
  price: number;
  image: string;
  stockCount: number;
  storageCapacity?: number;
  gbSize?: number;
  isSale?: boolean;
  tags?: string[];
}): Promise<Product> {
  const url = getAdminApiUrl('products');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getCookie('abo_admin_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  const data: unknown = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to create product');
  return (data as { product: Product }).product;
}

export async function deleteProduct(id: string): Promise<void> {
  const url = getAdminApiUrl(`products/${id}`);
  const headers: Record<string, string> = {};
  const token = getCookie('abo_admin_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || 'Failed to delete product');
  }
}
