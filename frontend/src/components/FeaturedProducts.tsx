'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';
import { getApiUrl } from '@/lib/apiConfig';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl('products?limit=6'), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products?.slice(0, 6) || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Mobile responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">منتجات مميزة</h2>
            <p className="text-text-muted text-lg">اكتشف أحدث وأفضل المنتجات لدينا</p>
          </div>

          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-accent hover:text-accent/80 
                     transition-colors font-medium"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid - Responsive gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {isLoading ? (
            // Skeleton loading
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-surface-card border border-border rounded-glass overflow-hidden"
              >
                <div className="aspect-square p-4">
                  <div className="w-full h-full bg-surface animate-shimmer rounded-lg" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-surface rounded animate-shimmer" />
                  <div className="h-4 bg-surface rounded w-3/4 animate-shimmer" />
                  <div className="h-5 bg-surface rounded w-24 animate-shimmer" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-text-muted">لا توجد منتجات متاحة حالياً</p>
            </div>
          )}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border
                     rounded-glass text-accent font-medium transition-colors hover:border-accent/30"
          >
            عرض جميع المنتجات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
