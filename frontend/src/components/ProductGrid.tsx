'use client';

import React from 'react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

function ProductCardSkeleton() {
  return (
    <div className="bg-surface-card border border-border rounded-glass overflow-hidden">
      {/* Image Skeleton */}
      <div className="aspect-square p-4">
        <div
          className="w-full h-full bg-surface animate-shimmer rounded-lg"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div
          className="h-4 bg-surface rounded animate-shimmer"
          style={{ backgroundSize: '200% 100%' }}
        />
        <div
          className="h-4 bg-surface rounded w-3/4 animate-shimmer"
          style={{ backgroundSize: '200% 100%' }}
        />
        <div className="flex gap-2 pt-2">
          <div
            className="h-5 bg-surface rounded w-24 animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
          <div
            className="h-5 bg-surface rounded w-16 animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-24 h-24 mb-6 rounded-full bg-surface border border-border 
                      flex items-center justify-center"
        >
          <svg
            className="w-10 h-10 text-text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">لا توجد منتجات</h3>
        <p className="text-text-muted max-w-sm">
          لم نجد أي منتجات تطابق معايير البحث. جرب تعديل الفلاتر أو البحث بكلمات مختلفة.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
