'use client';

import React, { memo, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeletonLite } from '@/components/ui/Skeleton';
import { useIntersection } from '@/hooks/useIntersection';
import type { Product } from '@/store/useStore';

export interface LazyProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToDrive?: (product: Product) => void;
  hasDrive?: boolean;
  /** When true, mount immediately without IntersectionObserver */
  eager?: boolean;
  rootMargin?: string;
}

const MemoProductCard = memo(ProductCard);

function LazyProductCard({
  product,
  onAddToCart,
  onAddToDrive,
  hasDrive,
  eager = false,
  rootMargin = '240px 0px',
}: LazyProductCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersection(containerRef, {
    once: true,
    disabled: eager,
    rootMargin,
  });

  return (
    <div ref={containerRef} className="product-grid-item h-full min-h-[320px]">
      {isVisible ? (
        <MemoProductCard
          product={product}
          onAddToCart={onAddToCart}
          onAddToDrive={onAddToDrive}
          hasDrive={hasDrive}
        />
      ) : (
        <ProductCardSkeletonLite />
      )}
    </div>
  );
}

export default memo(LazyProductCard);
