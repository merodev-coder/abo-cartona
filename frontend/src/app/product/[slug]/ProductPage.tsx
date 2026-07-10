'use client';

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useStore, type Product } from '@/store/useStore';
import { isFreeWithHardware } from '@/lib/freeContentUtils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
  categoryLabel: string;
}

// ============================================================================
// Stock Status Component
// ============================================================================

const StockStatus = memo(function StockStatus({ inStock }: { inStock: boolean }) {
  if (!inStock) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-error/10 dark:bg-error/15 w-fit border border-error/20">
        <span className="w-2.5 h-2.5 rounded-full bg-error" />
        <span className="text-body-sm font-semibold text-error">نفد المخزون</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 dark:bg-success/15 w-fit border border-success/20">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
      </span>
      <span className="text-body-sm font-semibold text-success">متوفر في المخزون</span>
    </div>
  );
});

// ============================================================================
// Brand Selector Component
// ============================================================================

interface BrandSelectorProps {
  brands: string[];
  selectedBrand: string;
  onChange: (brand: string) => void;
  disabled?: boolean;
}

const BrandSelector = memo(function BrandSelector({
  brands,
  selectedBrand,
  onChange,
  disabled = false,
}: BrandSelectorProps) {
  if (!brands || brands.length === 0) return null;

  const handleBrandChange = (brand: string) => {
    // If clicking the already selected brand, uncheck it
    if (selectedBrand === brand) {
      onChange('');
    } else {
      onChange(brand);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-body-sm font-semibold text-text-secondary text-text-secondary mb-3">
        اختر الماركة
      </label>

      <div className="space-y-2">
        {brands.map((brand, index) => (
          <motion.div
            key={brand}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.2 }}
            className={`
              relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
              ${
                selectedBrand === brand
                  ? 'bg-gradient-to-r from-brand-500/10 to-brand-500/5 dark:from-brand-500/20 dark:to-brand-500/10 border border-brand-200 dark:border-brand-500/30'
                  : 'bg-surface-secondary border border-border hover:bg-surface-tertiary'
              }
              ${disabled ? 'cursor-not-allowed opacity-60' : ''}
            `}
            onClick={() => !disabled && handleBrandChange(brand)}
          >
            {/* Custom Checkbox */}
            <div
              className={`relative w-5 h-5 rounded-md border-2 transition-all duration-200 flex-shrink-0 ${
                selectedBrand === brand
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-border border-border bg-surface bg-surface'
              }`}
            >
              {selectedBrand === brand && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Icon name="CheckIcon" size={12} className="text-white" />
                </motion.div>
              )}
            </div>

            {/* Brand Info */}
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  selectedBrand === brand
                    ? 'bg-brand-500 text-white shadow-brand-500/25'
                    : 'bg-surface text-text-muted'
                }
              `}
              >
                <Icon
                  name="TagIcon"
                  size={14}
                  className={selectedBrand === brand ? 'text-white' : 'text-text-muted'}
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    selectedBrand === brand ? 'text-brand-500' : 'text-text-primary'
                  }`}
                >
                  {brand}
                </span>
                {selectedBrand === brand && (
                  <span className="text-xs text-brand-500/70">الماركة المختارة</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Clear Selection Option */}
      {selectedBrand && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => onChange('')}
          disabled={disabled}
          className="mt-3 text-body-sm text-text-muted text-text-muted hover:text-brand-500 hover:text-brand-400 transition-colors"
        >
          مسح الاختيار
        </motion.button>
      )}
    </div>
  );
});

// ============================================================================
// Product Gallery Component
// ============================================================================

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const ProductGallery = memo(function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const mainImage = images[activeIdx] || '';

  if (!images.length) {
    return (
      <motion.div
        className="flex items-center justify-center h-96 rounded-3xl bg-surface-secondary bg-surface-secondary border border-border border-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center">
          <Icon name="PhotoIcon" size={48} className="text-text-muted mx-auto mb-2" />
          <p className="text-body-sm text-text-muted">لا توجد صور</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            className="relative w-full aspect-square rounded-3xl overflow-hidden cursor-zoom-in glass-product-card"
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.4, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setZoomed(true)}
          >
            <AppImage
              src={mainImage}
              alt={name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            <div className="absolute bottom-4 left-4 bg-surface/80 backdrop-blur-md text-text-primary text-text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-border border-border">
              {activeIdx + 1} / {images.length}
            </div>

            <div className="absolute top-4 right-4 bg-surface/60 backdrop-blur-sm text-text-secondary text-text-secondary text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-border border-border">
              <Icon name="MagnifyingGlassPlusIcon" size={14} />
              <span>اضغط للتكبير</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`
                relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all
                ${
                  idx === activeIdx
                    ? 'border-brand-500 shadow-glow-sm'
                    : 'border-border border-border hover:border-brand-300 dark:hover:border-brand-500/40'
                }
              `}
            >
              <AppImage
                src={img}
                alt={`${name} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {zoomed && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomed(false)}
          >
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh]"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <AppImage
                src={mainImage}
                alt={name}
                width={1200}
                height={1200}
                className="object-contain max-h-[85vh] rounded-2xl"
                sizes="90vw"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed(false);
                }}
                className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ============================================================================
// Product Info Component
// ============================================================================

interface ProductInfoProps {
  product: Product;
  selectedBrand: string;
  categoryLabel: string;
}

const ProductInfo = memo(function ProductInfo({
  product,
  selectedBrand,
  categoryLabel,
}: ProductInfoProps) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const isFreeContent = isFreeWithHardware(product.type, product.subtype);

  const descriptionLines = product.description
    ? product.description.split('\n').filter((line: string) => line.trim())
    : [];

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      {/* Category Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/products?cat=${product.type}`}
          className="text-body-sm text-text-muted text-text-muted hover:text-brand-500 hover:text-brand-400 transition-colors"
        >
          {categoryLabel}
        </Link>
        {product.subtype && (
          <>
            <Icon name="ChevronLeftIcon" size={14} className="text-text-muted" />
            <span className="text-body-sm text-text-muted text-text-muted">{product.subtype}</span>
          </>
        )}
      </div>

      {/* Product Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-text-primary text-text-primary leading-tight tracking-tight">
        {product.name}
      </h1>

      {/* Price - Hidden for free digital content */}
      {!isFreeContent && (
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-4xl md:text-5xl font-bold text-brand-500 tracking-tight">
            {product.price.toLocaleString('ar-EG')}
            <span className="text-xl md:text-2xl font-medium text-text-muted text-text-muted me-2">
              جنيه
            </span>
          </span>

          {Number(product.oldPrice) > 0 && (
            <>
              <span className="text-text-muted line-through text-xl md:text-2xl">
                {product.oldPrice?.toLocaleString('ar-EG')} جنيه
              </span>
              <span className="px-3 py-1 rounded-full bg-error/10 dark:bg-error/15 text-error text-body-sm font-bold border border-error/20">
                خصم {discount}%
              </span>
            </>
          )}
        </div>
      )}

      {/* Free Content Marketing Message */}
      {isFreeContent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-500/30 bg-gradient-to-br from-brand-50/80 to-surface-secondary dark:from-brand-500/10 dark:to-surface-dark-secondary/50 p-5"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center">
                <Icon name="GiftIcon" size={20} className="text-brand-500 text-brand-400" />
              </div>
              <span className="text-body-sm font-semibold text-brand-600 text-brand-400">
                محتوى مجاني
              </span>
            </div>

            <p className="text-body font-bold text-text-primary text-text-primary mb-3 leading-relaxed">
              اشتري هارد HDD أو SSD من المتجر واحصل على هذه الداتا مجاناً!
            </p>

            <Link
              href="/products?cat=storage"
              className="btn-primary inline-flex items-center gap-2 text-body-sm"
            >
              <Icon name="ShoppingBagIcon" size={16} />
              تسوق وحدات التخزين الآن
            </Link>
          </div>
        </motion.div>
      )}

      {/* Divider */}
      <div className="h-px bg-border dark:bg-border-dark" />

      {/* Description Bullet Points */}
      {descriptionLines.length > 0 && (
        <div>
          <h3 className="text-body font-semibold text-text-primary text-text-primary mb-3">
            حول هذا المنتج
          </h3>
          <ul className="space-y-2">
            {descriptionLines.slice(0, 4).map((line: string, idx: number) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-body-sm text-text-secondary text-text-secondary leading-relaxed"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                {line.trim()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {product.tags.slice(0, 4).map((tag: any, idx: number) => (
            <span key={tag.id || tag || idx} className="badge-primary">
              {tag.name || tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
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
  return (
    <div className="flex items-center gap-4">
      <label className="text-body-sm font-semibold text-text-secondary text-text-secondary">
        الكمية:
      </label>
      <div className="flex items-center gap-1 bg-surface-tertiary bg-surface-tertiary rounded-xl p-1 border border-border border-border">
        <motion.button
          type="button"
          onClick={() => quantity > 1 && onChange(quantity - 1)}
          disabled={disabled || quantity <= 1}
          whileTap={quantity > 1 ? { scale: 0.9 } : {}}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            quantity <= 1 || disabled
              ? 'text-text-muted cursor-not-allowed'
              : 'bg-surface bg-surface text-text-primary text-text-primary hover:bg-brand-50 dark:hover:bg-brand-500/10'
          }`}
        >
          <Icon name="MinusIcon" size={14} />
        </motion.button>

        <span className="w-12 text-center text-body font-bold text-text-primary text-text-primary">
          {quantity}
        </span>

        <motion.button
          type="button"
          onClick={() => quantity < maxQuantity && onChange(quantity + 1)}
          disabled={disabled || quantity >= maxQuantity}
          whileTap={quantity < maxQuantity ? { scale: 0.9 } : {}}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            quantity >= maxQuantity || disabled
              ? 'text-text-muted cursor-not-allowed'
              : 'bg-surface bg-surface text-text-primary text-text-primary hover:bg-brand-50 dark:hover:bg-brand-500/10'
          }`}
        >
          <Icon name="PlusIcon" size={14} />
        </motion.button>
      </div>
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
  isFreeContent?: boolean;
}

const ActionButtons = memo(function ActionButtons({
  product,
  selectedBrand,
  quantity,
  showBrandSelector,
  inStock,
  onAddToCart,
  onBuyNow,
  addedToCart,
  loading,
  isFreeContent = false,
}: ActionButtonsProps) {
  const isAddDisabled = !inStock || loading || (showBrandSelector && !selectedBrand);
  const isBuyDisabled = !inStock || (showBrandSelector && !selectedBrand);

  if (isFreeContent) {
    return (
      <div className="flex flex-col gap-3 pt-2">
        <div className="p-4 rounded-xl bg-surface-secondary bg-surface-tertiary border border-border-light border-border">
          <div className="flex items-center gap-3 text-body-sm text-text-secondary text-text-secondary">
            <Icon
              name="InformationCircleIcon"
              size={20}
              className="text-brand-500 text-brand-400 flex-shrink-0"
            />
            <span>هذا المنتج متاح مجاناً مع شراء أي هارد ديسك من المتجر</span>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="flex items-center gap-3 text-body-sm text-text-secondary text-text-secondary">
            <Icon
              name="TruckIcon"
              size={18}
              className="text-brand-500 text-brand-400 flex-shrink-0"
            />
            <span>شحن سريع عبر بوسطة لكل المحافظات</span>
          </div>
          <div className="flex items-center gap-3 text-body-sm text-text-secondary text-text-secondary">
            <Icon
              name="ArrowPathIcon"
              size={18}
              className="text-brand-500 text-brand-400 flex-shrink-0"
            />
            <span>استرجاع سهل خلال ١٤ يوم</span>
          </div>
          <div className="flex items-center gap-3 text-body-sm text-text-secondary text-text-secondary">
            <Icon
              name="ShieldCheckIcon"
              size={18}
              className="text-brand-500 text-brand-400 flex-shrink-0"
            />
            <span>دفع آمن ومضمون</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* Primary CTA */}
      <motion.button
        onClick={onAddToCart}
        disabled={isAddDisabled}
        whileHover={!isAddDisabled ? { scale: 1.02 } : {}}
        whileTap={!isAddDisabled ? { scale: 0.98 } : {}}
        className={`
          w-full py-4 rounded-full font-bold text-body flex items-center justify-center gap-2 transition-all duration-200
          ${
            addedToCart
              ? 'bg-success text-white'
              : isAddDisabled
                ? 'bg-surface-tertiary bg-surface-tertiary text-text-muted cursor-not-allowed'
                : 'bg-brand-500 text-white shadow-btn hover:shadow-btn-hover hover:bg-brand-600 bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300'
          }
        `}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : addedToCart ? (
          <>
            <Icon name="CheckCircleIcon" size={20} />
            <span>تم الإضافة للسلة!</span>
          </>
        ) : (
          <>
            <Icon name="ShoppingCartIcon" size={20} />
            <span>أضف للسلة</span>
          </>
        )}
      </motion.button>

      {/* Secondary CTA */}
      <motion.button
        onClick={onBuyNow}
        disabled={isBuyDisabled}
        whileHover={!isBuyDisabled ? { scale: 1.02 } : {}}
        whileTap={!isBuyDisabled ? { scale: 0.98 } : {}}
        className={`
          w-full py-4 rounded-full font-bold text-body flex items-center justify-center gap-2 transition-all duration-200 border-2
          ${
            isBuyDisabled
              ? 'border-border border-border text-text-muted cursor-not-allowed'
              : 'border-brand-500 text-brand-500 hover:bg-brand-50 dark:border-brand-400 text-brand-400 dark:hover:bg-brand-400/10'
          }
        `}
      >
        <Icon name="BoltIcon" size={20} />
        <span>اشتري الآن</span>
      </motion.button>

      {/* Trust Signals */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center gap-3 text-body-sm text-text-secondary text-text-secondary">
          <Icon
            name="TruckIcon"
            size={18}
            className="text-brand-500 text-brand-400 flex-shrink-0"
          />
          <span>شحن سريع عبر بوسطة لكل المحافظات</span>
        </div>
        <div className="flex items-center gap-3 text-body-sm text-text-secondary text-text-secondary">
          <Icon
            name="ArrowPathIcon"
            size={18}
            className="text-brand-500 text-brand-400 flex-shrink-0"
          />
          <span>استرجاع سهل خلال ١٤ يوم</span>
        </div>
        <div className="flex items-center gap-3 text-body-sm text-text-secondary text-text-secondary">
          <Icon
            name="ShieldCheckIcon"
            size={18}
            className="text-brand-500 text-brand-400 flex-shrink-0"
          />
          <span>دفع آمن ومضمون</span>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// Related Products Component
// ============================================================================

interface RelatedProductsProps {
  products: Product[];
  currentProductType: string;
}

const RelatedProducts = memo(function RelatedProducts({
  products,
  currentProductType,
}: RelatedProductsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  const filteredProducts = products.filter((p) => p.type === currentProductType).slice(0, 8);

  if (!filteredProducts.length) return null;

  return (
    <motion.section
      className="mt-16 pt-12 border-t border-border border-border"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary text-text-primary font-heading">
          منتجات مشابهة
        </h2>
        <Link
          href={`/products?cat=${currentProductType}`}
          className="text-body-sm text-brand-500 text-brand-400 hover:underline flex items-center gap-1"
        >
          <span>عرض الكل</span>
          <Icon name="ArrowLeftIcon" size={16} />
        </Link>
      </div>

      <div className="overflow-hidden" ref={containerRef}>
        <motion.div
          className="flex gap-4 cursor-grab active:cursor-grabbing pb-2"
          drag="x"
          style={{ x: dragX }}
          dragConstraints={containerRef}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        >
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex-shrink-0 w-56"
            >
              <Link href={`/product/${product.slug}`} className="block group" draggable={false}>
                <div className="bg-surface bg-surface-secondary rounded-2xl overflow-hidden border border-border border-border shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-surface-secondary bg-surface-tertiary">
                    {product.images?.[0] ? (
                      <AppImage
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        sizes="224px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="PhotoIcon" size={40} className="text-text-muted" />
                      </div>
                    )}

                    {product.oldPrice && product.oldPrice > product.price && (
                      <div className="absolute top-2 right-2">
                        <span className="badge-hot text-xs">
                          خصم{' '}
                          {Math.round(
                            ((product.oldPrice - product.price) / product.oldPrice) * 100
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text-primary text-text-primary leading-tight line-clamp-2 mb-2 group-hover:text-brand-500 group-hover:text-brand-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-brand-500">
                        {product.price.toLocaleString('ar-EG')} جنيه
                      </span>
                      {product.oldPrice && product.oldPrice > 0 && (
                        <span className="text-text-muted line-through text-xs">
                          {product.oldPrice.toLocaleString('ar-EG')} جنيه
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
});

// ============================================================================
// Main ProductPage Component
// ============================================================================

export default function ProductPage({ product, relatedProducts, categoryLabel }: ProductPageProps) {
  const { addToCart } = useStore();

  const [selectedBrand, setSelectedBrand] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(false);

  const inStock = product.stockCount > 0;
  const isFreeContent = isFreeWithHardware(product.type, product.subtype);

  const showBrandSelector =
    product.isBrandActive && Array.isArray(product.brands) && product.brands.length > 0;

  const handleAddToCart = useCallback(() => {
    if (!inStock) return;
    if (showBrandSelector && !selectedBrand) return;

    setLoading(true);

    const productWithBrand = selectedBrand
      ? { ...product, selectedBrand, brand: selectedBrand }
      : product;

    for (let i = 0; i < quantity; i++) {
      addToCart(productWithBrand);
    }

    setLoading(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }, [inStock, showBrandSelector, selectedBrand, quantity, product, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!inStock) return;
    if (showBrandSelector && !selectedBrand) return;

    const productWithBrand = selectedBrand
      ? { ...product, selectedBrand, brand: selectedBrand }
      : product;

    for (let i = 0; i < quantity; i++) {
      addToCart(productWithBrand);
    }

    window.location.href = '/checkout';
  }, [inStock, showBrandSelector, selectedBrand, quantity, product, addToCart]);

  return (
    <div className="min-h-screen bg-base" dir="rtl">
      <div className="section-container py-8 md:py-12 mt-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 text-body-sm text-text-muted hover:text-brand-500 transition-all duration-200 transform-gpu will-change-transform hover:translate-x-1"
          >
            <div className="w-10 h-10 rounded-full bg-surface-secondary border border-border flex items-center justify-center group-hover:border-brand-500/30 group-hover:bg-brand-500/10 transition-all duration-200">
              <Icon
                name="ArrowRightIcon"
                size={18}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
            </div>
            <span className="font-medium">رجوع</span>
          </button>
        </motion.div>

        {/* Split-View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Side — Product Info Stack */}
          <div className="order-2 lg:order-1 flex flex-col gap-8">
            <ProductInfo
              product={product}
              selectedBrand={selectedBrand}
              categoryLabel={categoryLabel}
            />

            <StockStatus inStock={inStock} />

            {showBrandSelector && (
              <BrandSelector
                brands={product.brands}
                selectedBrand={selectedBrand}
                onChange={setSelectedBrand}
                disabled={!inStock}
              />
            )}

            {selectedBrand && showBrandSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 p-4 rounded-xl glass-card border border-brand/30"
              >
                <Icon name="CheckBadgeIcon" size={20} className="text-brand" />
                <span className="text-text-secondary text-sm">الماركة المختارة:</span>
                <span className="text-brand font-bold">{selectedBrand}</span>
              </motion.div>
            )}

            {inStock && !isFreeContent && (
              <QuantitySelector
                quantity={quantity}
                maxQuantity={Math.min(product.stockCount, 10)}
                onChange={setQuantity}
                disabled={!inStock}
              />
            )}

            <ActionButtons
              product={product}
              selectedBrand={selectedBrand}
              quantity={quantity}
              showBrandSelector={showBrandSelector}
              inStock={inStock}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              addedToCart={addedToCart}
              loading={loading}
              isFreeContent={isFreeContent}
            />
          </div>

          {/* Right Side — Gallery */}
          <div className="order-1 lg:order-2">
            <ProductGallery images={product.images || []} name={product.name} />
          </div>
        </div>

        <RelatedProducts products={relatedProducts} currentProductType={product.type} />
      </div>
    </div>
  );
}
