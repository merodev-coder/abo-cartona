'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemedSelect } from '@/components/ui/ThemedSelect';
import type { Product } from '@/store/useStore';

interface ProductDisplayProps {
  product: Product;
  showPrice?: boolean;
  showBrandFilter?: boolean;
  className?: string;
}

/**
 * ProductDisplay - Unified product display component
 *
 * Architecture Rule: Brand dropdown only renders when:
 * - isBrandActive === true AND
 * - brands.length > 0
 */
export function ProductDisplay({
  product,
  showPrice = true,
  showBrandFilter = true,
  className = '',
}: ProductDisplayProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>(product.brands?.[0] || '');
  const [globalBrandFilter, setGlobalBrandFilter] = useState<string>('');

  // Check if brand features should be shown
  const showBrandSelector = product.isBrandActive && product.brands && product.brands.length > 0;

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {/* Brand Filter Dropdown - Only shown when product has brands activated */}
      {showBrandFilter && showBrandSelector && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-secondary bg-surface-tertiary/30 rounded-xl p-4 border border-border-light border-border"
        >
          <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-2 block">
            فلترة حسب البراند
          </label>
          <ThemedSelect
            value={globalBrandFilter}
            onChange={setGlobalBrandFilter}
            options={[
              { value: '', label: 'كل البراندات' },
              ...product.brands.map((brand: string) => ({ value: brand, label: brand })),
            ]}
            className="w-full"
          />
          {globalBrandFilter && (
            <p className="text-caption text-brand-500 text-brand-400 mt-2">
              يتم عرض المنتجات من براند: {globalBrandFilter}
            </p>
          )}
        </motion.div>
      )}

      {/* Brand / Subtype Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {product.subtype && (
          <Link
            href={`/products?cat=${product.type}`}
            className="text-body-sm text-text-muted text-text-muted hover:text-brand-500 hover:text-brand-400 transition-colors"
          >
            {product.subtype}
          </Link>
        )}
        {/* Brand Selector - Only shown when activated and has brands */}
        {showBrandSelector && (
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-text-muted text-text-muted">|</span>
            <span className="text-body-sm text-text-muted text-text-muted">البراند:</span>
            <ThemedSelect
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={product.brands.map((brand: string) => ({ value: brand, label: brand }))}
              className="w-40"
            />
          </div>
        )}
      </div>

      {/* Product Title */}
      <h1 className="text-h1 font-bold font-heading text-text-primary text-text-primary leading-tight">
        {product.name}
      </h1>

      {/* Price - Bold for visual hierarchy */}
      {showPrice && (
        <>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-500 tracking-tight">
              {product.price.toLocaleString('ar-EG')}
            </span>
            <span className="text-base font-medium text-text-muted text-text-muted">جنيه</span>
            {product.oldPrice && product.oldPrice > 0 && (
              <>
                <span className="text-text-muted line-through text-lg">
                  {product.oldPrice.toLocaleString('ar-EG')} جنيه
                </span>
                <span className="badge-error">
                  -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                </span>
              </>
            )}
          </div>
          <div className="h-px bg-border-light dark:bg-border-dark" />
        </>
      )}
    </div>
  );
}

export default ProductDisplay;
