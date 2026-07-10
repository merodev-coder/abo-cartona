'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useStore } from '@/store/useStore';
import CustomDropdown from '@/components/ui/CustomDropdown';

// ─── Click-to-Zoom Modal ─────────────────────────────────────────────────────
function ZoomModal({ image, name, onClose }: { image: string; name: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md cursor-zoom-out"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-[90vw] max-h-[90vh]"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <AppImage
          src={image}
          alt={name}
          width={1200}
          height={1200}
          className="object-contain max-h-[85vh] rounded-xl"
          sizes="90vw"
        />
        <button
          onClick={onClose}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
        >
          <Icon name="XMarkIcon" size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Gallery (Left Column) ───────────────────────────────────────────────────
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const mainImage = images[activeIdx] || '';

  if (!images.length) {
    return (
      <motion.div
        className="flex items-center justify-center h-96 rounded-2xl bg-surface-secondary bg-surface-secondary border border-border-light border-border"
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
      className="flex flex-col-reverse lg:flex-row gap-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      {/* Vertical thumbnails (left side on desktop) */}
      {images.length > 1 && (
        <div
          className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px]"
          style={{ scrollbarWidth: 'thin' }}
        >
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                idx === activeIdx
                  ? 'border-brand-500 shadow-glow-sm'
                  : 'border-border-light border-border hover:border-brand-300 dark:hover:border-brand-500/40'
              }`}
            >
              <AppImage
                src={img}
                alt={`${name} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Main image with zoom */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white bg-surface-secondary border border-border-light border-border cursor-zoom-in"
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.4, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setZoomed(true)}
          >
            <AppImage
              src={mainImage}
              alt={name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {activeIdx + 1} / {images.length}
            </div>
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white/70 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
              <Icon name="MagnifyingGlassPlusIcon" size={14} />
              اضغط للتكبير
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Zoom modal */}
        <AnimatePresence>
          {zoomed && <ZoomModal image={mainImage} name={name} onClose={() => setZoomed(false)} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Product Info (Middle Column) ────────────────────────────────────────────
export function ProductInfo({ product }: { product: any }) {
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
      {/* Subtype */}
      <div className="flex items-center gap-2 flex-wrap">
        {product.subtype && (
          <Link
            href={`/products?cat=${product.type}`}
            className="text-body-sm text-text-muted text-text-muted hover:text-brand-500 hover:text-brand-400 transition-colors"
          >
            {product.subtype}
          </Link>
        )}
      </div>

      {/* Product Title */}
      <h1 className="text-h1 font-heading text-text-primary text-text-primary leading-tight">
        {product.name}
      </h1>

      {/* Sale Badge - if on sale page */}
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
        <span className="text-3xl font-bold text-primary-500 tracking-tight">
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

// ─── Buy Box (Right Column - Sticky) ─────────────────────────────────────────
export function BuyBox({ product }: { product: any }) {
  const { addToCart } = useStore();
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);

  const inStock = product.stockCount > 0;
  // Check if oldPrice exists and is greater than 0
  const hasOldPrice = product.oldPrice && product.oldPrice > 0;
  const discount = hasOldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const triggerFlyingAnimation = useCallback(() => {
    const cartIcon = document.getElementById('global-cart-icon');
    if (!cartIcon || !imageRef.current) return;

    const srcRect = imageRef.current.getBoundingClientRect();
    const destRect = cartIcon.getBoundingClientRect();

    const clone = document.createElement('div');
    const imgSrc = product.images?.[0] || '/placeholder.png';
    clone.innerHTML = `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;

    Object.assign(clone.style, {
      position: 'fixed',
      top: `${srcRect.top}px`,
      left: `${srcRect.left}px`,
      width: `${srcRect.width}px`,
      height: `${srcRect.height}px`,
      borderRadius: '12px',
      zIndex: '9999',
      pointerEvents: 'none',
      transition: 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: '0 10px 25px rgba(5,150,105,0.3)',
    });

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = `${destRect.top + destRect.height / 2 - 16}px`;
      clone.style.left = `${destRect.left + destRect.width / 2 - 16}px`;
      clone.style.width = '32px';
      clone.style.height = '32px';
      clone.style.opacity = '0.3';
      clone.style.transform = 'scale(0.3) rotate(10deg)';

      setTimeout(() => {
        clone.remove();
        // Pulse the cart icon
        cartIcon.classList.add('scale-125');
        setTimeout(() => cartIcon.classList.remove('scale-125'), 300);
      }, 650);
    });
  }, [product.images]);

  const handleAddToCart = () => {
    if (!inStock) return;
    setLoading(true);
    // Add multiple based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    triggerFlyingAnimation();
    setLoading(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    triggerFlyingAnimation();
    window.location.href = '/checkout';
  };

  return (
    <motion.div
      className="bg-white bg-surface-secondary rounded-2xl p-6 sticky top-24 flex flex-col gap-5 shadow-card hover:shadow-card-hover dark:shadow-card-dark border border-border-light border-border"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* Price Block */}
      <div className="text-center pb-4 border-b border-border-light border-border">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-3xl font-bold text-text-primary text-text-primary tracking-tight">
            {product.price.toLocaleString('ar-EG')}
          </span>
          <span className="text-body-sm font-medium text-text-muted text-text-muted">جنيه</span>
        </div>
        {hasOldPrice && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-text-muted line-through text-body-sm">
              {product.oldPrice?.toLocaleString('ar-EG')} جنيه
            </span>
            <span className="badge-error">وفر {discount}%</span>
          </div>
        )}
      </div>

      {/* Stock status - Teal indicator */}
      <div className="flex items-center gap-2">
        {inStock ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-body-sm font-medium text-brand-500 text-brand-400">
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

      {/* Quantity selector */}
      {inStock && (
        <div className="flex items-center gap-3">
          <label className="text-body-sm font-semibold text-text-secondary text-text-secondary">
            الكمية:
          </label>
          <CustomDropdown
            value={String(quantity)}
            onChange={(value) => setQuantity(Number(value))}
            options={Array.from({ length: Math.min(product.stockCount, 10) }, (_, i) => ({
              value: String(i + 1),
              label: String(i + 1),
            }))}
            className="w-20"
            size="sm"
          />
        </div>
      )}

      {/* Add to Cart Button */}
      <motion.button
        onClick={handleAddToCart}
        disabled={!inStock || loading}
        whileHover={inStock ? { scale: 1.02 } : {}}
        whileTap={inStock ? { scale: 0.98 } : {}}
        className={`w-full py-4 rounded-xl font-semibold text-body-sm flex items-center justify-center gap-2 transition-all duration-200 ${
          addedToCart
            ? 'bg-success text-white'
            : !inStock
              ? 'bg-surface-tertiary bg-white/5 text-text-muted cursor-not-allowed'
              : 'bg-brand-500 text-white shadow-btn hover:shadow-btn-hover hover:bg-brand-600 bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300'
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

      {/* Buy Now Button - Outline style */}
      <motion.button
        onClick={handleBuyNow}
        disabled={!inStock}
        whileHover={inStock ? { scale: 1.02 } : {}}
        whileTap={inStock ? { scale: 0.98 } : {}}
        className={`w-full py-4 rounded-xl font-semibold text-body-sm flex items-center justify-center gap-2 transition-all duration-200 border-2 ${
          !inStock
            ? 'border-border border-border text-text-muted cursor-not-allowed'
            : 'border-brand-500 text-brand-500 hover:bg-brand-50 dark:border-brand-400 text-brand-400 dark:hover:bg-brand-400/10'
        }`}
      >
        <Icon name="BoltIcon" size={18} />
        <span>اشتري الآن</span>
      </motion.button>

      <div className="h-px bg-border-light dark:bg-border-dark" />

      {/* Trust Signals */}
      <div className="space-y-3">
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
          <span>استرجاع سهل خلال 14 يوم</span>
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

      {/* Seller info */}
      <div className="bg-surface-secondary dark:bg-white/[0.03] rounded-xl p-3 text-caption text-text-muted text-text-muted space-y-1">
        <div className="flex justify-between">
          <span>يُشحن من</span>
          <span className="font-semibold text-text-primary text-text-primary">أبوكرتونة</span>
        </div>
        <div className="flex justify-between">
          <span>يُباع بواسطة</span>
          <span className="font-semibold text-text-primary text-text-primary">أبوكرتونة</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Related Products Carousel ───────────────────────────────────────────────
export function RelatedCarousel({ products }: { products: any[] }) {
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!products?.length) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-text-primary text-text-primary font-heading">
          منتجات مشابهة
        </h2>
      </div>

      <div className="overflow-hidden" ref={containerRef}>
        <motion.div
          className="flex gap-4 cursor-grab active:cursor-grabbing"
          drag="x"
          style={{ x: dragX }}
          dragConstraints={containerRef}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        >
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="flex-shrink-0 w-56 product-card group block"
              draggable={false}
            >
              <div className="relative h-56 overflow-hidden">
                {p.images?.[0] ? (
                  <AppImage
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="224px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-secondary dark:bg-white/[0.02]">
                    <Icon name="PhotoIcon" size={32} className="text-text-muted" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-text-primary text-white leading-tight line-clamp-2 mb-2">
                  {p.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-brand-500">
                    {p.price.toLocaleString('ar-EG')} جنيه
                  </span>
                  {p.oldPrice && p.oldPrice > 0 && (
                    <span className="text-text-muted text-text-muted line-through text-sm mt-1">
                      {p.oldPrice.toLocaleString('ar-EG')} جنيه
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
