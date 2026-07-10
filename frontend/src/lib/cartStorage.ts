'use client';

import { get, set, del } from 'idb-keyval';

interface CartItem {
  id: string;
  quantity: number;
  [key: string]: unknown;
}

interface CartData {
  items: CartItem[];
  lastSyncedAt: number | null;
  version: number;
}

const CART_KEY = 'cart-storage-v2';
const CART_VERSION = 2;

/**
 * IndexedDB storage for cart persistence
 * More reliable than localStorage for larger data and supports async operations
 */
export const idbCartStorage = {
  async getItem(): Promise<CartData | null> {
    try {
      const data = await get(CART_KEY);
      if (!data) return null;

      // Check version for migration
      if (data.version !== CART_VERSION) {
        console.info('[CartStorage] Migrating from version', data.version, 'to', CART_VERSION);
        return migrateCartData(data);
      }

      return data;
    } catch (error) {
      console.error('[CartStorage] Failed to get item:', error);
      return null;
    }
  },

  async setItem(data: CartData): Promise<void> {
    try {
      await set(CART_KEY, {
        ...data,
        version: CART_VERSION,
        lastSavedAt: Date.now(),
      });
    } catch (error) {
      console.error('[CartStorage] Failed to set item:', error);
      throw error;
    }
  },

  async removeItem(): Promise<void> {
    try {
      await del(CART_KEY);
    } catch (error) {
      console.error('[CartStorage] Failed to remove item:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await del(CART_KEY);
    } catch (error) {
      console.error('[CartStorage] Failed to clear:', error);
      throw error;
    }
  },
};

/**
 * Migrate old cart data formats
 */
function migrateCartData(oldData: Record<string, unknown>): CartData {
  // Handle v1 format (flat array)
  if (Array.isArray(oldData)) {
    return {
      items: oldData as CartItem[],
      lastSyncedAt: null,
      version: CART_VERSION,
    };
  }

  // Handle partial data
  return {
    items: (oldData.items as CartItem[]) || [],
    lastSyncedAt: (oldData.lastSyncedAt as number) || null,
    version: CART_VERSION,
  };
}

/**
 * Fallback localStorage storage for environments where IndexedDB fails
 */
export const localStorageCartFallback = {
  getItem(): CartData | null {
    try {
      const data = localStorage.getItem(CART_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('[CartStorage] LocalStorage fallback failed:', error);
      return null;
    }
  },

  setItem(data: CartData): void {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[CartStorage] LocalStorage fallback failed:', error);
    }
  },

  removeItem(): void {
    try {
      localStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error('[CartStorage] LocalStorage fallback failed:', error);
    }
  },
};

/**
 * Hybrid storage that tries IndexedDB first, falls back to localStorage
 */
export const hybridCartStorage = {
  async getItem(): Promise<CartData | null> {
    try {
      return await idbCartStorage.getItem();
    } catch {
      return localStorageCartFallback.getItem();
    }
  },

  async setItem(data: CartData): Promise<void> {
    try {
      await idbCartStorage.setItem(data);
    } catch {
      localStorageCartFallback.setItem(data);
    }
  },

  async removeItem(): Promise<void> {
    try {
      await idbCartStorage.removeItem();
    } catch {
      localStorageCartFallback.removeItem();
    }
  },
};
