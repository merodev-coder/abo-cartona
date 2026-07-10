import type { Product } from '@/store/useStore';

export function parseCapacityGB(capacityGB: number | null | undefined, name: string): number {
  if (typeof capacityGB === 'number' && capacityGB > 0) return capacityGB;
  const match = name.match(/(\d+(?:\.\d+)?)\s*(TB|GB)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return match[2].toUpperCase() === 'TB' ? value * 1000 : value;
}

export interface CartItemForCalc {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity?: number;
  storageCapacity?: number | null;
  gbSize?: number | null;
}

export interface CartTotals {
  hardwareSubtotal: number;
  totalPhysicalStorageGB: number;
  totalDataGB: number;
  freeDataGB: number;
  payableDataGB: number;
  dataCost: number;
  total: number;
}

export function calculateCartTotals(cartItems: CartItemForCalc[]): CartTotals {
  const getQty = (item: { quantity?: number }) => item.quantity || 1;

  const hardwareSubtotal = cartItems
    .filter((p) => p.type !== 'data')
    .reduce((acc, p) => acc + p.price * getQty(p), 0);

  const totalPhysicalStorageGB = cartItems
    .filter((p) => p.type === 'storage')
    .reduce((acc, p) => acc + parseCapacityGB(p.storageCapacity, p.name) * getQty(p), 0);

  const totalDataGB = cartItems
    .filter((p) => p.type === 'data')
    .reduce((acc, p) => acc + (p.gbSize || 0) * getQty(p), 0);

  const freeDataGB = Math.min(totalDataGB, totalPhysicalStorageGB);
  const payableDataGB = Math.max(0, totalDataGB - totalPhysicalStorageGB);
  const dataCost = payableDataGB * 0.5;

  return {
    hardwareSubtotal,
    totalPhysicalStorageGB,
    totalDataGB,
    freeDataGB,
    payableDataGB,
    dataCost,
    total: hardwareSubtotal + dataCost,
  };
}

export function getDataItemEffectivePrices(cartItems: CartItemForCalc[]): Map<string, number> {
  const priceMap = new Map<string, number>();

  const totalPhysicalStorageGB = cartItems
    .filter((p) => p.type === 'storage')
    .reduce((acc, p) => acc + parseCapacityGB(p.storageCapacity, p.name) * (p.quantity || 1), 0);

  let remainingFreeGB = totalPhysicalStorageGB;

  for (const item of cartItems.filter((p) => p.type === 'data')) {
    const itemTotalGB = (item.gbSize || 0) * (item.quantity || 1);
    const freeGB = Math.min(itemTotalGB, remainingFreeGB);
    const payableGB = itemTotalGB - freeGB;
    const qty = item.quantity || 1;
    priceMap.set(item.id, qty > 0 ? (payableGB * 0.5) / qty : 0);
    remainingFreeGB = Math.max(0, remainingFreeGB - freeGB);
  }

  return priceMap;
}

export interface StorageAggregation {
  type: string;
  subtype: string;
  capacityGB: number;
  count: number;
  totalCapacityGB: number;
  displayName: string;
}

/**
 * Aggregates storage products by type, subtype, and capacity
 * Returns an array of storage groups with counts and total capacity
 */
export function aggregateStorageByType(products: Product[]): StorageAggregation[] {
  const storageMap = new Map<string, StorageAggregation>();

  products
    .filter((product) => product.type === 'storage' && product.storageCapacity && product.storageCapacity > 0)
    .forEach((product) => {
      const capacity = product.storageCapacity!; // We know it's not null from the filter
      const qty = (product as any).quantity ?? 1;
      const key = `${product.type}-${product.subtype}-${capacity}`;
      const existing = storageMap.get(key);

      if (existing) {
        existing.count += qty;
        existing.totalCapacityGB = existing.count * existing.capacityGB;
      } else {
        const displayName = generateStorageDisplayName(product);
        storageMap.set(key, {
          type: product.type,
          subtype: product.subtype,
          capacityGB: capacity,
          count: qty,
          totalCapacityGB: capacity * qty,
          displayName,
        });
      }
    });

  return Array.from(storageMap.values()).sort((a, b) => b.totalCapacityGB - a.totalCapacityGB);
}

/**
 * Formats storage capacity for display
 */
export function formatStorageCapacity(capacityGB: number): string {
  if (capacityGB >= 1000) {
    const tb = capacityGB / 1000;
    return `${tb}TB`;
  }
  return `${capacityGB}GB`;
}

/**
 * Generates a human-readable display name for storage products
 */
function generateStorageDisplayName(product: Product): string {
  const capacity = formatStorageCapacity(product.storageCapacity || 0);
  const subtype = product.subtype || 'Storage';
  
  // Handle common storage types
  if (subtype.toLowerCase().includes('hdd') || subtype.toLowerCase().includes('hard')) {
    return `HDD ${capacity}`;
  } else if (subtype.toLowerCase().includes('ssd') || subtype.toLowerCase().includes('solid')) {
    return `SSD ${capacity}`;
  } else if (subtype.toLowerCase().includes('nvme') || subtype.toLowerCase().includes('m.2')) {
    return `NVMe ${capacity}`;
  }
  
  return `${subtype} ${capacity}`;
}

/**
 * Gets total storage capacity with aggregation details
 */
export function getTotalStorageWithAggregation(products: Product[]): {
  totalCapacityGB: number;
  aggregations: StorageAggregation[];
  formattedTotal: string;
} {
  const aggregations = aggregateStorageByType(products);
  const totalCapacityGB = aggregations.reduce((sum, agg) => sum + agg.totalCapacityGB, 0);
  
  return {
    totalCapacityGB,
    aggregations,
    formattedTotal: formatStorageCapacity(totalCapacityGB),
  };
}

/**
 * Creates a summary string for storage aggregation
 * Example: "2x 1TB HDD + 1x 500GB SSD = 2.5TB"
 */
export function createStorageSummary(aggregations: StorageAggregation[]): string {
  if (aggregations.length === 0) return '0GB';
  
  const parts = aggregations.map(agg => {
    if (agg.count === 1) {
      return agg.displayName;
    }
    return `${agg.count}x ${agg.displayName}`;
  });
  
  const totalCapacity = aggregations.reduce((sum, agg) => sum + agg.totalCapacityGB, 0);
  const totalFormatted = formatStorageCapacity(totalCapacity);
  
  if (parts.length === 1) {
    return `${parts[0]} = ${totalFormatted}`;
  }
  
  return `${parts.join(' + ')} = ${totalFormatted}`;
}
