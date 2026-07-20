'use client';

import React, { memo } from 'react';
import LazyProductCard from '@/components/LazyProductCard';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/store/useStore';

const LAZY_THRESHOLD = 40;
const DEFAULT_EAGER_COUNT = 4;

const MemoProductCard = memo(ProductCard);

export interface LazyProductGridProps {
  items: Product[];
  onAddToCart?: (product: Product) => void;
  onAddToDrive?: (product: Product) => void;
  hasDrive?: boolean;
  columns?: 2 | 3 | 4;
  /** Enable card-level lazy mounting when total items meet threshold */
  lazyThreshold?: number;
  /** Force lazy mode regardless of count (e.g. products listing page) */
  forceLazy?: boolean;
  /** Cards above the fold that mount immediately when lazy mode is active */
  eagerCount?: number;
  rootMargin?: string;
}

const LazyProductGrid = memo(function LazyProductGrid({
  items,
  onAddToCart,
  onAddToDrive,
  hasDrive,
  columns = 4,
  lazyThreshold = LAZY_THRESHOLD,
  forceLazy = false,
  eagerCount = DEFAULT_EAGER_COUNT,
  rootMargin = '240px 0px',
}: LazyProductGridProps) {
  const useLazyCards = forceLazy || items.length >= lazyThreshold;

  const gridCols =
    columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={`grid ${gridCols} gap-5 md:gap-6`}>
      {items.map((product, index) => {
        const eager = !useLazyCards || index < eagerCount;

        if (eager) {
          return (
            <div key={product.id} className="product-grid-item h-full">
              <MemoProductCard
                product={product}
                onAddToCart={onAddToCart}
                onAddToDrive={onAddToDrive}
                hasDrive={hasDrive}
              />
            </div>
          );
        }

        return (
          <LazyProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onAddToDrive={onAddToDrive}
            hasDrive={hasDrive}
            rootMargin={rootMargin}
          />
        );
      })}
    </div>
  );
});

export default LazyProductGrid;
