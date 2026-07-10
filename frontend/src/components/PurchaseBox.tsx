'use client';

import React, { useState } from 'react';
import { CreditCard, Lock, Truck } from 'lucide-react';
import type { Product } from '@/types';

interface PurchaseBoxProps {
  product: Product;
}

export default function PurchaseBox({ product }: PurchaseBoxProps) {
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < product.stockCount) setQuantity(quantity + 1);
  };

  const inStock = product.stockCount > 0;

  return (
    <div className="sticky top-8 p-6 rounded-glass bg-surface border border-border backdrop-blur-glass">
      {/* Product Name */}
      <h1 className="text-2xl font-bold text-text-primary mb-4 leading-tight">{product.name}</h1>

      {/* Price Block */}
      <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-border">
        <span className="text-3xl font-bold text-accent">{product.price.toLocaleString()} ج.م</span>
        {product.oldPrice && (
          <span className="text-lg text-text-muted line-through">
            {product.oldPrice.toLocaleString()} ج.م
          </span>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={inStock ? 'text-green-400' : 'text-red-400'}>
          {inStock ? 'متاح في المخزن' : 'نفذ المخزون'}
        </span>
      </div>

      {/* Quantity Selector */}
      <div className="mb-6">
        <label className="block text-text-muted text-sm mb-2">الكمية</label>
        <div className="flex items-center gap-3">
          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-lg border border-border bg-surface-card 
                     text-text-primary hover:border-accent transition-all duration-200 transform-gpu will-change-transform
                     disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
                     flex items-center justify-center text-xl font-medium"
          >
            −
          </button>
          <span className="w-12 text-center text-lg font-semibold text-text-primary">
            {quantity}
          </span>
          <button
            onClick={increaseQuantity}
            disabled={quantity >= product.stockCount}
            className="w-10 h-10 rounded-lg border border-border bg-surface-card 
                     text-text-primary hover:border-accent transition-all duration-200 transform-gpu will-change-transform
                     disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
                     flex items-center justify-center text-xl font-medium"
          >
            +
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3 mb-6">
        <button
          disabled={!inStock}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform-gpu will-change-transform
                     ${
                       inStock
                         ? 'bg-accent text-base hover:shadow-glow-sm hover:scale-[1.02]'
                         : 'bg-surface-card text-text-muted cursor-not-allowed'
                     }`}
        >
          اشتري الآن
        </button>

        <button
          disabled={!inStock}
          className={`w-full py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 transform-gpu will-change-transform
                     ${
                       inStock
                         ? 'border-accent text-accent hover:bg-accent/10 hover:scale-[1.02]'
                         : 'border-border text-text-muted cursor-not-allowed'
                     }`}
        >
          أضف للسلة
        </button>
      </div>

      {/* Secure Payment Icons */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-text-muted text-xs">
          <Lock className="w-4 h-4" />
          <span>دفع آمن</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted text-xs">
          <CreditCard className="w-4 h-4" />
          <span>فيزا & ماستركارد</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted text-xs">
          <Truck className="w-4 h-4" />
          <span>شحن سريع</span>
        </div>
      </div>
    </div>
  );
}
