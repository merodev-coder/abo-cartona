'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

// ─── Client Product Info Component ─────────────────────────────────
export function ClientProductInfo({ product }: { product: any }) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Parse description into bullet points
  const descriptionLines = product.description
    ? product.description.split('\n').filter((line: string) => line.trim())
    : [];

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Subtype Row */}
      {product.subtype && (
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/products?cat=${product.type}`}
            className="text-body-sm text-text-muted text-text-muted hover:text-brand-500 hover:text-brand-400 transition-colors"
          >
            {product.subtype}
          </Link>
        </div>
      )}

      {/* Product Title */}
      <h1 className="text-h1 font-heading text-text-primary text-text-primary leading-tight">
        {product.name}
      </h1>

      {/* Sale Badge - if on sale */}
      {product.isSale && product.oldPrice && product.oldPrice > 0 && (
        <div className="flex items-center gap-2">
          <span className="badge-hot">خصم {discount}%</span>
          <span className="text-body-sm text-text-muted">منتج مميز في صفحة العروض</span>
        </div>
      )}

      {/* Star Rating (dummy 4.5/5) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 text-amber-400">
          {'★★★★'.split('').map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          {/* Half star */}
          <svg width="16" height="16" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#374151" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </div>
        <span className="text-body-sm text-text-muted font-semibold">4.5</span>
      </div>

      <div className="h-px bg-border-light dark:bg-border-dark" />

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-brand-500 tracking-tight">
          {product.price.toLocaleString('ar-EG')}{' '}
          <span className="text-base font-medium text-text-muted text-text-muted">جنيه</span>
        </span>
        {product.oldPrice && product.oldPrice > 0 && (
          <>
            <span className="text-text-muted line-through text-lg">
              {product.oldPrice.toLocaleString('ar-EG')} جنيه
            </span>
            <span className="badge-error">-{discount}%</span>
          </>
        )}
      </div>

      <div className="h-px bg-border-light dark:bg-border-dark" />

      {/* Description as bullet points */}
      {descriptionLines.length > 0 && (
        <div>
          <h3 className="text-body-sm font-bold text-text-primary text-text-primary mb-3">
            حول هذا المنتج
          </h3>
          <ul className="space-y-2">
            {descriptionLines.map((line: string, idx: number) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-body-sm text-text-secondary text-text-secondary leading-relaxed"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                {line.trim()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {product.tags.map((tag: any) => (
            <span key={tag.id || tag} className="badge-primary">
              {tag.name || tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
