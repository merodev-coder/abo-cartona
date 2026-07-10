'use client';

import React, { useMemo, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { Product } from '@/store/useStore';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface RecommendationCarouselProps {
  currentProduct: Product;
  allProducts: Product[];
  maxItems?: number;
  className?: string;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

// ============================================================================
// Product Card Component
// ============================================================================

const ProductCard = React.memo(function ProductCard({ product, index }: ProductCardProps) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const inStock = product.stockCount > 0;

  // Show brand badge only if brand is active and product has brand data
  const showBrandBadge = product.isBrandActive && product.brands && product.brands.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex-shrink-0 w-[280px] group transform-gpu will-change-transform"
    >
      <Link
        href={`/product/${product.slug}`}
        className="block bg-surface-secondary rounded-2xl overflow-hidden border border-border hover:border-brand-500/50 dark:hover:border-brand-400/50 transition-all duration-300 hover:shadow-card-hover dark:hover:shadow-card-dark-hover h-full transform-gpu will-change-transform hover:scale-[1.02]"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-surface-secondary bg-surface-tertiary">
          {product.images?.[0] ? (
            <AppImage
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="280px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="PhotoIcon" size={48} className="text-text-muted" />
            </div>
          )}

          {/* Sale Badge */}
          {product.isSale && product.oldPrice && product.oldPrice > 0 && (
            <div className="absolute top-3 left-3">
              <span className="badge-hot text-xs">خصم {discount}%</span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-error text-white text-body-sm font-semibold rounded-lg">
                نفد المخزون
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">
          {/* Category Tag */}
          {product.subtype && (
            <span className="text-caption text-text-muted">{product.subtype}</span>
          )}

          {/* Product Name */}
          <h3 className="text-body font-semibold text-text-primary leading-tight line-clamp-2 group-hover:text-brand-500 transition-colors">
            {product.name}
          </h3>

          {/* Brand Badge */}
          {showBrandBadge && (
            <div className="flex items-center gap-1">
              <span className="badge-secondary text-xs">
                {product.brands[0]}
                {product.brands.length > 1 && ` +${product.brands.length - 1}`}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-body-lg font-bold text-brand-500">
              {product.price.toLocaleString('ar-EG')} جنيه
            </span>
            {product.oldPrice && product.oldPrice > 0 && (
              <span className="text-caption text-text-muted line-through">
                {product.oldPrice.toLocaleString('ar-EG')} جنيه
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

// ============================================================================
// Navigation Button Component
// ============================================================================

interface NavButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
}

const NavButton = React.memo(function NavButton({ direction, onClick, disabled }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center
        border-2 transition-all duration-200
        ${
          disabled
            ? 'border-border text-text-muted cursor-not-allowed opacity-50'
            : 'border-brand-500 text-brand-500 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-400/10'
        }
      `}
      aria-label={direction === 'prev' ? 'السابق' : 'التالي'}
    >
      <Icon name={direction === 'prev' ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={24} />
    </motion.button>
  );
});

// ============================================================================
// Main RecommendationCarousel Component
// ============================================================================

export function RecommendationCarousel({
  currentProduct,
  allProducts,
  maxItems = 8,
  className = '',
}: RecommendationCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Smart recommendation algorithm
  const recommendedProducts = useMemo(() => {
    if (!allProducts?.length || !currentProduct) return [];

    const currentId = currentProduct.id || currentProduct._id;

    // Filter out current product
    const otherProducts = allProducts.filter((p) => {
      const pId = p.id || p._id;
      return pId !== currentId;
    });

    if (otherProducts.length === 0) return [];

    // Scoring system
    const scoredProducts = otherProducts.map((product) => {
      let score = 0;

      // Priority 1: Same category (highest weight)
      if (product.type === currentProduct.type) {
        score += 100;

        // Bonus for same subtype
        if (product.subtype === currentProduct.subtype) {
          score += 30;
        }
      }

      // Priority 2: Same brand (if brand active)
      if (currentProduct.isBrandActive && product.isBrandActive) {
        const currentBrands = currentProduct.brands || [];
        const productBrands = product.brands || [];

        const hasMatchingBrand = currentBrands.some((brand) => productBrands.includes(brand));

        if (hasMatchingBrand) {
          score += 50;
        }
      }

      // Priority 3: Price similarity (+/- 20% range)
      const currentPrice = currentProduct.price;
      const priceDiff = Math.abs(product.price - currentPrice);
      const priceRatio = priceDiff / currentPrice;

      if (priceRatio <= 0.2) {
        score += 25 * (1 - priceRatio); // Higher score for closer prices
      }

      // Boost in-stock products
      if (product.stockCount > 0) {
        score += 10;
      }

      // Slight boost for sale items (user interest signal)
      if (product.isSale) {
        score += 5;
      }

      return { product, score };
    });

    // Sort by score descending and take top items
    const sorted = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems)
      .map((item) => item.product);

    return sorted;
  }, [currentProduct, allProducts, maxItems]);

  const visibleItems = 4;
  const maxIndex = Math.max(0, recommendedProducts.length - visibleItems);

  const scrollToIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, maxIndex));
      setCurrentIndex(clampedIndex);
    },
    [maxIndex]
  );

  const handlePrev = useCallback(() => {
    scrollToIndex(currentIndex - 1);
  }, [currentIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    scrollToIndex(currentIndex + 1);
  }, [currentIndex, scrollToIndex]);

  const handleDragStart = useCallback(() => {
    // Drag start handler - could be used for analytics or UI feedback
  }, []);

  const handleDragEnd = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: { offset: { x: number }; velocity: { x: number } }
    ) => {
      // Drag end handler - isDragging state removed as it was unused

      const threshold = 50;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      // RTL: negative offset means moving left (showing next items)
      if (offset < -threshold || velocity < -500) {
        scrollToIndex(currentIndex + 1);
      } else if (offset > threshold || velocity > 500) {
        scrollToIndex(currentIndex - 1);
      }
    },
    [currentIndex, scrollToIndex]
  );

  // Don't render if no recommendations
  if (!recommendedProducts.length) {
    return null;
  }

  return (
    <section className={`mt-16 pt-10 border-t border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-brand-500 rounded-full" />
          <h2 className="text-h3 font-heading text-text-primary text-text-primary">
            منتجات مشابهة
          </h2>
        </div>

        {/* Navigation Controls */}
        {recommendedProducts.length > visibleItems && (
          <div className="flex items-center gap-2">
            <NavButton direction="prev" onClick={handlePrev} disabled={currentIndex === 0} />
            <NavButton direction="next" onClick={handleNext} disabled={currentIndex >= maxIndex} />
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className="overflow-hidden" ref={containerRef}>
        <motion.div
          className="flex gap-4 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{
            left: -(recommendedProducts.length * 296 - (containerRef.current?.offsetWidth || 0)),
            right: 0,
          }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          animate={{
            x: -currentIndex * 296, // 280px card + 16px gap
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          <AnimatePresence mode="popLayout">
            {recommendedProducts.map((product, index) => (
              <ProductCard key={product.id || product._id} product={product} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Pagination Dots */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'w-6 bg-brand-500'
                  : 'bg-border-light dark:bg-border-dark hover:bg-text-muted'
              }`}
              aria-label={`انتقل إلى المجموعة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecommendationCarousel;
