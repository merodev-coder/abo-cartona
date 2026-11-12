'use client';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/apiConfig';
export interface PaymentConfig {
  methods: { id: string; name: string; destination: string }[];
  maxBytes: number;
  store?: { name: string; address: string; hours: string; phone: string; mapUrl: string };
}
export function usePaymentConfig() {
  return useQuery<PaymentConfig>({
    queryKey: ['payment-config'],
    staleTime: 60000,
    retry: 1,
    queryFn: async ({ signal }) => {
      const response = await fetch(getApiUrl('orders/payment-config'), {
        signal,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('تعذر تحميل طرق الدفع.');
      return response.json();
    },
  });
}
