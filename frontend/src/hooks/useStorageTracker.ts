import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { parseCapacityGB } from '@/lib/storageUtils';

const STORAGE_SUBTYPES = ['hdd', 'ssd', 'nvme', 'm.2', 'storage', 'hard', 'disk'];

function isStorageItem(item: { type: string; subtype?: string }): boolean {
  if (item.type === 'storage') return true;
  const sub = (item.subtype || '').toLowerCase();
  return STORAGE_SUBTYPES.some((s) => sub.includes(s));
}

export function formatGB(gb: number): string {
  if (gb === 0) return '0 GB';
  if (gb >= 1000) {
    const tb = gb / 1000;
    return `${Number.isInteger(tb) ? tb : tb.toFixed(1)} TB`;
  }
  return `${gb} GB`;
}

export interface StorageBreakdownItem {
  name: string;
  subtype: string;
  capacityGB: number;
  quantity: number;
  totalCapacityGB: number;
}

export interface StorageTrackerResult {
  totalStorageGB: number;
  usedStorageGB: number;
  availableStorageGB: number;
  breakdown: StorageBreakdownItem[];
  formattedTotal: string;
  formattedUsed: string;
  formattedAvailable: string;
  fillPercentage: number;
  hasStorage: boolean;
}

export function useStorageTracker(): StorageTrackerResult {
  const { cartItems, driveItems } = useStore();

  return useMemo(() => {
    const storageItems = cartItems.filter(isStorageItem);

    const breakdown: StorageBreakdownItem[] = storageItems.map((item) => {
      const qty = (item as any).quantity ?? 1;
      const capGB = parseCapacityGB(item.storageCapacity, item.name);
      return {
        name: item.name,
        subtype: item.subtype || 'Storage',
        capacityGB: capGB,
        quantity: qty,
        totalCapacityGB: capGB * qty,
      };
    });

    const totalStorageGB = breakdown.reduce((acc, b) => acc + b.totalCapacityGB, 0);

    const usedStorageGB = driveItems.reduce(
      (acc, p) => acc + parseCapacityGB(p.storageCapacity, p.name) * ((p as any).quantity ?? 1),
      0
    );

    const availableStorageGB = Math.max(0, totalStorageGB - usedStorageGB);
    const fillPercentage =
      totalStorageGB > 0 ? Math.min(100, (usedStorageGB / totalStorageGB) * 100) : 0;

    return {
      totalStorageGB,
      usedStorageGB,
      availableStorageGB,
      breakdown,
      formattedTotal: formatGB(totalStorageGB),
      formattedUsed: formatGB(usedStorageGB),
      formattedAvailable: formatGB(availableStorageGB),
      fillPercentage,
      hasStorage: totalStorageGB > 0,
    };
  }, [cartItems, driveItems]);
}
