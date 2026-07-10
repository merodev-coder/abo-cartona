'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useStore, type Product } from '@/store/useStore';
import Icon from '@/components/ui/AppIcon';
import CustomDropdown from '@/components/ui/CustomDropdown';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ProductDetailsVariant = 'full' | 'compact' | 'card' | 'checkout';

interface ProductDetailsProps {
  product: Product;
  variant?: ProductDetailsVariant;
  className?: string;
  showBrandSelector?: boolean;
  onBrandChange?: (brand: string) => void;
  selectedBrand?: string;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  disableAnimations?: boolean;
}

// ============================================================================
// Brand Selector Component (Uses CustomDropdown)
// ============================================================================

interface BrandSelectorProps {
  brands: string[];
  selectedBrand: string;
  onChange: (brand: string) => void;
  error?: boolean;
  onErrorClear?: () => void;
  disabled?: boolean;
}

const BrandSelector = memo(function BrandSelector({
  brands,
  selectedBrand,
  onChange,
  error = false,
  onErrorClear,
  disabled = false,
}: BrandSelectorProps) {
  const handleChange = useCallback(
    (value: string) => {
      onChange(value);
      if (onErrorClear) onErrorClear();
    },
    [onChange, onErrorClear]
  );

  // Convert brands to dropdown options
  const options = brands.map((brand) => ({
    value: brand,
    label: brand,
    icon: 'TagIcon',
  }));

  return (
    <div className="space-y-2">
      <CustomDropdown
        options={options}
        value={selectedBrand}
        onChange={handleChange}
        label="اختر الماركة"
        placeholder="اختر الماركة..."
        error={error}
        errorMessage={error ? 'يرجى اختيار الماركة قبل الإضافة للسلة' : undefined}
        required
        disabled={disabled}
        clearable
        size="md"
      />
    </div>
  );
});

// ============================================================================
// Quantity Selector Component
// ============================================================================

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
}

const QuantitySelector = memo(function QuantitySelector({
  quantity,
  maxQuantity,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrease = useCallback(() => {
    if (quantity > 1) onChange(quantity - 1);
  }, [quantity, onChange]);

  const handleIncrease = useCallback(() => {
    if (quantity < maxQuantity) onChange(quantity + 1);
  }, [quantity, maxQuantity, onChange]);

  return (
    <div className="flex items-center gap-3">
      <label className="text-body-sm font-semibold text-text-secondary">الكمية:</label>
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={handleDecrease}
          disabled={disabled || quantity <= 1}
          whileTap={quantity > 1 ? { scale: 0.9 } : {}}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            quantity <= 1 || disabled
              ? 'bg-surface-tertiary text-text-muted cursor-not-allowed'
              : 'bg-surface-secondary text-text-primary hover:bg-brand-50'
          }`}
        >
          <Icon name="MinusIcon" size={14} />
        </motion.button>

        <span className="w-12 text-center text-body font-semibold text-text-primary">
          {quantity}
        </span>

        <motion.button
          type="button"
          onClick={handleIncrease}
          disabled={disabled || quantity >= maxQuantity}
          whileTap={quantity < maxQuantity ? { scale: 0.9 } : {}}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            quantity >= maxQuantity || disabled
              ? 'bg-surface-tertiary text-text-muted cursor-not-allowed'
              : 'bg-surface-secondary text-text-primary hover:bg-brand-50'
          }`}
        >
          <Icon name="PlusIcon" size={14} />
        </motion.button>
      </div>
    </div>
  );
});

// ============================================================================
// Product Info Section
// ============================================================================

interface ProductInfoSectionProps {
  product: Product;
  variant: ProductDetailsVariant;
}

const ProductInfoSection = memo(function ProductInfoSection({
  product,
  variant,
}: ProductInfoSectionProps) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Parse description into bullet points
  const descriptionLines = product.description
    ? product.description.split('\n').filter((line: string) => line.trim())
    : [];

  if (variant === 'compact' || variant === 'checkout') {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href={`/product/${product.slug}`}
          className="text-body font-semibold text-text-primary hover:text-brand-500 transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        {product.subtype && <span className="text-caption text-text-muted">{product.subtype}</span>}
        <div className="flex items-baseline gap-2">
          <span className="text-body font-bold text-brand-500">
            {product.price.toLocaleString('ar-EG')} جنيه
          </span>
          {product.oldPrice && product.oldPrice > 0 && (
            <span className="text-caption text-text-muted line-through">
              {product.oldPrice.toLocaleString('ar-EG')} جنيه
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Subtype / Category */}
      {product.subtype && (
        <Link
          href={`/products?cat=${product.type}`}
          className="text-body-sm text-text-muted hover:text-brand-500 transition-colors w-fit"
        >
          {product.subtype}
        </Link>
      )}

      {/* Title */}
      <h1
        className={`font-heading text-text-primary leading-tight ${
          variant === 'card' ? 'text-body-lg line-clamp-2' : 'text-h1'
        }`}
      >
        {product.name}
      </h1>

      {/* Sale Badge */}
      {product.isSale && product.oldPrice && product.oldPrice > 0 && (
        <div className="flex items-center gap-2">
          <span className="badge-hot">خصم {discount}%</span>
          <span className="text-body-sm text-text-muted">منتج مميز</span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span
          className={`font-bold text-brand-500 tracking-tight ${
            variant === 'card' ? 'text-h3' : 'text-3xl'
          }`}
        >
          {product.price.toLocaleString('ar-EG')}
          <span
            className={`font-medium text-text-muted me-1 ${
              variant === 'card' ? 'text-body' : 'text-base'
            }`}
          >
            جنيه
          </span>
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

      {/* Description (only for full variant) */}
      {variant === 'full' && descriptionLines.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h3 className="text-body-sm font-bold text-text-primary mb-3">حول هذا المنتج</h3>
          <ul className="space-y-2">
            {descriptionLines.map((line: string, idx: number) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-body-sm text-text-secondary leading-relaxed"
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
    </div>
  );
});

// ============================================================================
// Action Buttons Component
// ============================================================================

interface ActionButtonsProps {
  product: Product;
  selectedBrand: string;
  quantity: number;
  showBrandSelector: boolean;
  inStock: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  addedToCart: boolean;
  loading: boolean;
  variant: ProductDetailsVariant;
}

const ActionButtons = memo(function ActionButtons({
  product,
  selectedBrand,
  showBrandSelector,
  inStock,
  onAddToCart,
  onBuyNow,
  addedToCart,
  loading,
  variant,
}: ActionButtonsProps) {
  const isAddDisabled = !inStock || loading || (showBrandSelector && !selectedBrand);
  const isBuyDisabled = !inStock || (showBrandSelector && !selectedBrand);

  if (variant === 'checkout') {
    return null; // No actions in checkout variant
  }

  if (variant === 'compact' || variant === 'card') {
    return (
      <motion.button
        onClick={onAddToCart}
        disabled={isAddDisabled}
        whileHover={!isAddDisabled ? { scale: 1.02 } : {}}
        whileTap={!isAddDisabled ? { scale: 0.98 } : {}}
        className={`w-full py-3 rounded-xl font-semibold text-body-sm flex items-center justify-center gap-2 transition-all duration-200 ${
          addedToCart
            ? 'bg-success text-white'
            : isAddDisabled
              ? 'bg-surface-tertiary bg-white/5 text-text-muted cursor-not-allowed'
              : 'bg-brand-500 text-white shadow-btn hover:shadow-btn-hover hover:bg-brand-600'
        }`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : addedToCart ? (
          <>
            <Icon name="CheckCircleIcon" size={18} />
            <span>تم الإضافة!</span>
          </>
        ) : (
          <>
            <Icon name="ShoppingCartIcon" size={18} />
            <span>أضف للسلة</span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Add to Cart Button */}
      <motion.button
        onClick={onAddToCart}
        disabled={isAddDisabled}
        whileHover={!isAddDisabled ? { scale: 1.02 } : {}}
        whileTap={!isAddDisabled ? { scale: 0.98 } : {}}
        className={`w-full py-4 rounded-xl font-semibold text-body-sm flex items-center justify-center gap-2 transition-all duration-200 ${
          addedToCart
            ? 'bg-success text-white'
            : isAddDisabled
              ? 'bg-surface-tertiary text-text-muted cursor-not-allowed'
              : 'bg-brand-500 text-white shadow-btn hover:shadow-btn-hover hover:bg-brand-600'
        }`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : addedToCart ? (
          <>
            <Icon name="CheckCircleIcon" size={18} />
            <span>تم الإضافة!</span>
          </>
        ) : (
          <>
            <Icon name="ShoppingCartIcon" size={18} />
            <span>أضف للسلة</span>
          </>
        )}
      </motion.button>

      {/* Buy Now Button */}
      <motion.button
        onClick={onBuyNow}
        disabled={isBuyDisabled}
        whileHover={!isBuyDisabled ? { scale: 1.02 } : {}}
        whileTap={!isBuyDisabled ? { scale: 0.98 } : {}}
        className={`w-full py-4 rounded-xl font-semibold text-body-sm flex items-center justify-center gap-2 transition-all duration-200 border-2 ${
          isBuyDisabled
            ? 'border-border text-text-muted cursor-not-allowed'
            : 'border-brand-500 text-brand-500 hover:bg-brand-50'
        }`}
      >
        <Icon name="BoltIcon" size={18} />
        <span>اشتري الآن</span>
      </motion.button>
    </div>
  );
});

// ============================================================================
// Stock Status Component
// ============================================================================

interface StockStatusProps {
  inStock: boolean;
  stockCount: number;
}

const StockStatus = memo(function StockStatus({ inStock, stockCount }: StockStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {inStock ? (
        <>
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-body-sm font-medium text-brand-500">
            متوفر في المخزن — يُشحن غداً
          </span>
        </>
      ) : (
        <>
          <span className="w-2.5 h-2.5 rounded-full bg-error" />
          <span className="text-body-sm font-medium text-error">نفد المخزون</span>
        </>
      )}
    </div>
  );
});

// ============================================================================
// Selected Brand Display Component
// ============================================================================

interface SelectedBrandDisplayProps {
  brand: string;
}

const SelectedBrandDisplay = memo(function SelectedBrandDisplay({
  brand,
}: SelectedBrandDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="flex items-center gap-2 p-3 rounded-lg bg-brand-50 border border-brand-200"
    >
      <Icon name="CheckBadgeIcon" size={16} className="text-brand-500" />
      <span className="text-body-sm text-text-muted">الماركة المختارة:</span>
      <span className="text-body-sm font-semibold text-brand-600">{brand}</span>
    </motion.div>
  );
});

// ============================================================================
// Main ProductDetails Component
// ============================================================================

function ProductDetails({
  product,
  variant = 'full',
  className = '',
  showBrandSelector: propShowBrandSelector,
  onBrandChange: propOnBrandChange,
  selectedBrand: propSelectedBrand,
  quantity: propQuantity,
  onQuantityChange: propOnQuantityChange,
  disableAnimations = false,
}: ProductDetailsProps) {
  const { addToCart } = useStore();

  // Internal state (only used if not controlled externally)
  const [internalSelectedBrand, setInternalSelectedBrand] = useState('');
  const [internalQuantity, setInternalQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandError, setBrandError] = useState(false);

  // Determine if brand selector should show (only for full/card variants)
  const shouldShowBrandSelector =
    propShowBrandSelector !== undefined
      ? propShowBrandSelector
      : (variant === 'full' || variant === 'card') &&
        product.isBrandActive &&
        product.brands &&
        product.brands.length > 0;

  // Use external or internal state
  const selectedBrand = propSelectedBrand !== undefined ? propSelectedBrand : internalSelectedBrand;
  const quantity = propQuantity !== undefined ? propQuantity : internalQuantity;

  const setSelectedBrand = useCallback(
    (brand: string) => {
      if (propOnBrandChange) {
        propOnBrandChange(brand);
      } else {
        setInternalSelectedBrand(brand);
      }
    },
    [propOnBrandChange]
  );

  const setQuantity = useCallback(
    (qty: number) => {
      if (propOnQuantityChange) {
        propOnQuantityChange(qty);
      } else {
        setInternalQuantity(qty);
      }
    },
    [propOnQuantityChange]
  );

  const inStock = product.stockCount > 0;

  const handleAddToCart = useCallback(() => {
    if (!inStock) return;

    // Validation: Check if brand is required but not selected
    if (shouldShowBrandSelector && !selectedBrand) {
      setBrandError(true);
      setTimeout(() => setBrandError(false), 3000);
      return;
    }

    setLoading(true);

    // Add product with selected brand to cart
    const productWithBrand = selectedBrand
      ? { ...product, selectedBrand, brand: selectedBrand }
      : product;

    for (let i = 0; i < quantity; i++) {
      addToCart(productWithBrand);
    }

    setLoading(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }, [inStock, shouldShowBrandSelector, selectedBrand, quantity, product, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!inStock) return;

    // Validation: Check if brand is required but not selected
    if (shouldShowBrandSelector && !selectedBrand) {
      setBrandError(true);
      setTimeout(() => setBrandError(false), 3000);
      return;
    }

    const productWithBrand = selectedBrand
      ? { ...product, selectedBrand, brand: selectedBrand }
      : product;

    for (let i = 0; i < quantity; i++) {
      addToCart(productWithBrand);
    }

    window.location.href = '/checkout';
  }, [inStock, shouldShowBrandSelector, selectedBrand, quantity, product, addToCart]);

  // Compact variant (for cart/checkout items)
  if (variant === 'compact') {
    return (
      <div className={`flex gap-4 ${className}`}>
        {/* Thumbnail */}
        <Link href={`/product/${product.slug}`} className="flex-shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-secondary">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="PhotoIcon" size={24} className="text-text-muted" />
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <ProductInfoSection product={product} variant={variant} />
          {selectedBrand && (
            <p className="text-caption text-brand-500 mt-1">الماركة: {selectedBrand}</p>
          )}
        </div>
      </div>
    );
  }

  // Card variant (for product grids)
  if (variant === 'card') {
    return (
      <motion.div
        className={`bg-surface-secondary rounded-2xl overflow-hidden border border-border flex flex-col h-full ${className}`}
        whileHover={!disableAnimations ? { y: -4 } : {}}
        transition={{ duration: 0.2 }}
      >
        {/* Image */}
        <Link
          href={`/product/${product.slug}`}
          className="relative aspect-square overflow-hidden bg-surface-tertiary"
        >
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="PhotoIcon" size={48} className="text-text-muted" />
            </div>
          )}

          {/* Sale Badge */}
          {product.isSale && product.oldPrice && (
            <div className="absolute top-3 left-3">
              <span className="badge-hot">
                خصم {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
              </span>
            </div>
          )}

          {/* Stock Badge */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-error text-white text-body-sm font-semibold rounded-lg">
                نفد المخزون
              </span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          <ProductInfoSection product={product} variant={variant} />

          {shouldShowBrandSelector && (
            <BrandSelector
              brands={product.brands}
              selectedBrand={selectedBrand}
              onChange={setSelectedBrand}
              error={brandError}
              onErrorClear={() => setBrandError(false)}
              disabled={!inStock}
            />
          )}

          {selectedBrand && shouldShowBrandSelector && (
            <SelectedBrandDisplay brand={selectedBrand} />
          )}

          <div className="mt-auto pt-3">
            <ActionButtons
              product={product}
              selectedBrand={selectedBrand}
              quantity={quantity}
              showBrandSelector={shouldShowBrandSelector}
              inStock={inStock}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              addedToCart={addedToCart}
              loading={loading}
              variant={variant}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Full variant (default - for product detail page)
  return (
    <motion.div
      className={`bg-surface-secondary rounded-2xl p-6 border border-border flex flex-col gap-5 shadow-card ${className}`}
      initial={disableAnimations ? {} : { y: 20, opacity: 0 }}
      animate={disableAnimations ? {} : { y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ProductInfoSection product={product} variant={variant} />

      <div className="h-px bg-border" />

      {/* Stock Status */}
      <StockStatus inStock={inStock} stockCount={product.stockCount} />

      {/* Brand Selector */}
      {shouldShowBrandSelector && (
        <BrandSelector
          brands={product.brands}
          selectedBrand={selectedBrand}
          onChange={setSelectedBrand}
          error={brandError}
          onErrorClear={() => setBrandError(false)}
          disabled={!inStock}
        />
      )}

      {selectedBrand && shouldShowBrandSelector && <SelectedBrandDisplay brand={selectedBrand} />}

      {/* Quantity Selector */}
      {inStock && (
        <QuantitySelector
          quantity={quantity}
          maxQuantity={Math.min(product.stockCount, 10)}
          onChange={setQuantity}
          disabled={!inStock}
        />
      )}

      {/* Action Buttons */}
      <ActionButtons
        product={product}
        selectedBrand={selectedBrand}
        quantity={quantity}
        showBrandSelector={shouldShowBrandSelector}
        inStock={inStock}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        addedToCart={addedToCart}
        loading={loading}
        variant={variant}
      />

      {/* Trust Signals */}
      <div className="h-px bg-border" />
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-body-sm text-text-secondary">
          <Icon name="TruckIcon" size={18} className="text-brand-500 flex-shrink-0" />
          <span>شحن سريع عبر بوسطة لكل المحافظات</span>
        </div>
        <div className="flex items-center gap-3 text-body-sm text-text-secondary">
          <Icon name="ArrowPathIcon" size={18} className="text-brand-500 flex-shrink-0" />
          <span>استرجاع سهل خلال 14 يوم</span>
        </div>
        <div className="flex items-center gap-3 text-body-sm text-text-secondary">
          <Icon name="ShieldCheckIcon" size={18} className="text-brand-500 flex-shrink-0" />
          <span>دفع آمن ومضمون</span>
        </div>
      </div>

      {/* Seller info */}
      <div className="bg-surface-secondary rounded-xl p-3 text-caption text-text-muted space-y-1">
        <div className="flex justify-between">
          <span>يُشحن من</span>
          <span className="font-semibold text-text-primary">أبوكرتونة</span>
        </div>
        <div className="flex justify-between">
          <span>يُباع بواسطة</span>
          <span className="font-semibold text-text-primary">أبوكرتونة</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default memo(ProductDetails);
export { BrandSelector, QuantitySelector, ProductInfoSection, StockStatus, SelectedBrandDisplay };
