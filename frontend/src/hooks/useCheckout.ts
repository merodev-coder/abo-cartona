'use client';

import { useCallback, useRef, useState } from 'react';
import { withRetry } from '@/lib/retry';
import type { Product } from '@/store/useStore';
import { getApiUrl } from '@/lib/apiConfig';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderData {
  items: OrderItem[];
  driveItems: OrderItem[];
  totalAmount: number;
  totalGb: number;
  paymentMethod: string;
  paymentScreenshot?: File | null;
  customerInfo?: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  };
}

interface CheckoutState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  orderId: string | null;
  error: Error | null;
  retryAttempt: number;
}

interface CheckoutActions {
  submit: (orderData: OrderData) => Promise<string | null>;
  reset: () => void;
  cancel: () => void;
  isSubmitting: boolean;
}

/**
 * Hook for managing checkout submission with retry logic
 * Prevents double submissions and handles network failures gracefully
 */
export function useCheckoutSubmission(): CheckoutState & CheckoutActions {
  const [state, setState] = useState<CheckoutState>({
    status: 'idle',
    orderId: null,
    error: null,
    retryAttempt: 0,
  });

  // Abort controller for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  // Submission lock to prevent duplicates
  const isSubmittingRef = useRef(false);

  const submit = useCallback(async (orderData: OrderData): Promise<string | null> => {
    // Prevent double submission
    if (isSubmittingRef.current) {
      console.warn('[Checkout] Submission already in progress');
      return null;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    isSubmittingRef.current = true;

    setState((prev) => ({
      ...prev,
      status: 'submitting',
      error: null,
      retryAttempt: 0,
    }));

    try {
      const result = await withRetry(
        async () => {
          const formData = new FormData();
          formData.append(
            'data',
            JSON.stringify({
              items: orderData.items,
              driveItems: orderData.driveItems,
              totalAmount: orderData.totalAmount,
              totalGb: orderData.totalGb,
              paymentMethod: orderData.paymentMethod,
              customerInfo: orderData.customerInfo,
            })
          );

          if (orderData.paymentScreenshot) {
            formData.append('paymentScreenshot', orderData.paymentScreenshot);
          }

          const response = await fetch(getApiUrl('orders'), {
            method: 'POST',
            body: formData,
            signal: abortControllerRef.current?.signal,
          });

          if (!response.ok) {
            const errorResponse = new Error(await response.text());
            (errorResponse as Error & { status: number }).status = response.status;
            throw errorResponse;
          }

          return response.json();
        },
        {
          maxRetries: 3,
          baseDelay: 2000,
          onRetry: (attempt, _error) => {
            setState((prev) => ({
              ...prev,
              retryAttempt: attempt,
            }));
          },
        },
        'checkout-submission'
      );

      setState({
        status: 'success',
        orderId: result.orderId || result.id,
        error: null,
        retryAttempt: 0,
      });

      return result.orderId || result.id;
    } catch (error) {
      // Silently ignore aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }

      setState({
        status: 'error',
        orderId: null,
        error: error instanceof Error ? error : new Error(String(error)),
        retryAttempt: 0,
      });

      throw error;
    } finally {
      isSubmittingRef.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    isSubmittingRef.current = false;
    setState({
      status: 'idle',
      orderId: null,
      error: null,
      retryAttempt: 0,
    });
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    isSubmittingRef.current = false;
    setState((prev) => ({
      ...prev,
      status: 'idle',
    }));
  }, []);

  return {
    ...state,
    submit,
    reset,
    cancel,
    isSubmitting: state.status === 'submitting',
  };
}

/**
 * Hook for inventory synchronization with cart
 * Updates cart when stock changes on server
 */
export function useInventorySync(cartItems: Product[], _pollingInterval = 30000) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const lastSyncRef = useRef<number>(0);

  const syncInventory = useCallback(async () => {
    const productIds = cartItems.map((item) => item.id);
    if (productIds.length === 0) return;

    setSyncStatus('syncing');

    try {
      const response = await fetch('/api/inventory/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) throw new Error('Inventory sync failed');

      const updates: Array<{ productId: string; stockCount: number }> = await response.json();

      lastSyncRef.current = Date.now();
      setSyncStatus('idle');

      return updates;
    } catch (error) {
      setSyncStatus('error');
      console.error('[InventorySync] Failed:', error);
      return null;
    }
  }, [cartItems]);

  return {
    syncInventory,
    syncStatus,
    lastSyncedAt: lastSyncRef.current,
  };
}
