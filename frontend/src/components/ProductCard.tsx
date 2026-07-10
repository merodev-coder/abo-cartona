'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import type { Product } from '@/store/useStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import { isFreeWithHardware } from '@/lib/freeContentUtils';
import CustomDropdown from '@/components/ui/CustomDropdown';
import styled from 'styled-components';
import { useStore } from '@/store/useStore';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToDrive?: (product: Product) => void;
  hasDrive?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToDrive,
  hasDrive,
}: ProductCardProps) {
  const router = useRouter();
  const { getStorageAggregation } = useStore();
  const isData = product.type === 'data';
  const isStorage = product.type === 'storage';
  const isFreeContent = isFreeWithHardware(product.type, product.subtype);
  const inStock = product.stockCount > 0;
  const flyingCloneRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (flyingCloneRef.current) {
        flyingCloneRef.current.remove();
        flyingCloneRef.current = null;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const [selectedBrand, setSelectedBrand] = useState('');
  const [showBrandSelector, setShowBrandSelector] = useState(false);
  const [brandError, setBrandError] = useState(false);

  const needsBrandSelection =
    product.isBrandActive && product.brands && product.brands.length > 0 && !isData;

  const triggerFlyingAnimation = useCallback(() => {
    const cartIcon = document.getElementById('global-cart-icon');
    if (!cartIcon || !imageRef.current) return;

    const srcRect = imageRef.current.getBoundingClientRect();
    const destRect = cartIcon.getBoundingClientRect();

    const clone = document.createElement('div');
    const imgSrc = product.images?.[0] || product.image || '/placeholder.png';
    clone.innerHTML = `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />`;

    Object.assign(clone.style, {
      position: 'fixed',
      top: `${srcRect.top}px`,
      left: `${srcRect.left}px`,
      width: `${srcRect.width}px`,
      height: `${srcRect.height}px`,
      borderRadius: '12px',
      zIndex: '9999',
      pointerEvents: 'none',
      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: '0 10px 25px rgba(5,150,105,0.3)',
    });

    if (flyingCloneRef.current) flyingCloneRef.current.remove();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    flyingCloneRef.current = clone;
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = `${destRect.top + destRect.height / 2 - 16}px`;
      clone.style.left = `${destRect.left + destRect.width / 2 - 16}px`;
      clone.style.width = '32px';
      clone.style.height = '32px';
      clone.style.opacity = '0.3';
      clone.style.transform = 'scale(0.3) rotate(10deg)';

      timeoutRef.current = setTimeout(() => {
        if (flyingCloneRef.current === clone) flyingCloneRef.current = null;
        clone.remove();
        cartIcon.classList.add('scale-125');
        timeoutRef.current = setTimeout(() => {
          cartIcon.classList.remove('scale-125');
          timeoutRef.current = null;
        }, 300);
      }, 600);
    });
  }, [product.images, product.image]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (needsBrandSelection && !selectedBrand) {
      router.push(`/product/${product.slug || product.id || product._id}`);
      return;
    }
    if (onAddToCart && inStock) {
      try {
        const productWithBrand = selectedBrand
          ? { ...product, selectedBrand, brand: selectedBrand }
          : product;
        onAddToCart(productWithBrand);
        triggerFlyingAnimation();
      } catch (error) {
        if (error instanceof Error && error.message.includes('الماركة')) {
          router.push(`/product/${product.slug || product.id || product._id}`);
        }
      }
    }
  };

  const handleDriveAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToDrive) onAddToDrive(product);
  };

  const hasOldPrice =
    product.oldPrice !== undefined && product.oldPrice !== null && product.oldPrice > 0;

  const typeConfig: Record<string, { label: string; color: string; dot: string }> = {
    laptops: { label: 'لابتوب', color: 'rgba(99,179,255,0.15)', dot: '#63b3ff' },
    accessories: { label: 'إكسسوار', color: 'rgba(167,139,250,0.15)', dot: '#a78bfa' },
    storage: { label: 'قطع كمبيوتر', color: 'rgba(52,211,153,0.15)', dot: '#34d399' },
    data: { label: 'داتا', color: 'rgba(251,191,36,0.15)', dot: '#fbbf24' },
  };
  const type = typeConfig[product.type] ?? typeConfig.data;

  const brandOptions =
    product.brands?.map((brand) => ({
      value: brand,
      label: brand,
      icon: 'TagIcon',
    })) || [];

  const discountPct =
    hasOldPrice && product.oldPrice
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <StyledWrapper>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex flex-col h-full"
        style={{ perspective: '1200px' }}
      >
        {/* ── Card Shell ── */}
        <motion.div
          whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="neumorphic-card relative flex flex-col h-full overflow-hidden"
        >
          {/* Ambient border glow — only on hover */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${type.dot}28 0%, transparent 70%)`,
              boxShadow: `inset 0 0 0 1px ${type.dot}40`,
            }}
          />

          {/* Static border */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-10"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
          />

          {/* ── IMAGE ── */}
          <div
            ref={imageRef}
            className="relative overflow-hidden aspect-[4/3] min-h-[140px] sm:min-h-[180px]"
            style={{
              background: 'linear-gradient(135deg, #0d1420 0%, #141e2e 100%)',
            }}
          >
            <Link
              href={`/product/${product.slug || product.id || product._id}`}
              className="block relative w-full h-full"
            >
              {/* Subtle grid texture */}
              <div
                className="absolute inset-0 z-[1] opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <AppImage
                src={product.images?.[0] || product.image || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110 z-[2]"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              {/* Bottom fade */}
              <div
                className="absolute inset-x-0 bottom-0 h-24 z-[3] pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, #0e1623 0%, transparent 100%)',
                }}
              />
            </Link>

            {/* ── Badges top-left ── */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
              {product.isSale && hasOldPrice && discountPct > 0 && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    boxShadow: '0 2px 10px rgba(239,68,68,0.45)',
                  }}
                >
                  <Icon name="FireIcon" size={10} />-{discountPct}%
                </span>
              )}
              {isData && (product.gbSize ?? 0) > 0 && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full tracking-wide"
                  style={{
                    background: 'rgba(251,191,36,0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(251,191,36,0.3)',
                  }}
                >
                  {product.gbSize} GB
                </span>
              )}
              {isStorage && (product.storageCapacity ?? 0) > 0 && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full tracking-wide"
                  style={{
                    background: 'rgba(52,211,153,0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(52,211,153,0.3)',
                  }}
                >
                  {product.storageCapacity! >= 1000 
                    ? `${(product.storageCapacity! / 1000).toFixed(1)}TB` 
                    : `${product.storageCapacity}GB`
                  }
                </span>
              )}
            </div>

            {/* Out of stock overlay */}
            {!inStock && (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center"
                style={{ background: 'rgba(10,14,22,0.75)', backdropFilter: 'blur(2px)' }}
              >
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.3)',
                  }}
                >
                  نفد المخزون
                </span>
              </div>
            )}

            {/* Quick-add floating button */}
            {onAddToCart && inStock && !isData && (
              <motion.button
                onClick={handleAdd}
                initial={{ opacity: 0, scale: 0.7 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.5)',
                }}
                aria-label="أضف للسلة"
              >
                <Icon name="ShoppingCartIcon" size={16} className="text-white" />
              </motion.button>
            )}

            {/* Brand selector overlay */}
            <AnimatePresence>
              {showBrandSelector && needsBrandSelection && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 flex items-center justify-center p-4"
                  style={{ background: 'rgba(5,10,20,0.9)', backdropFilter: 'blur(8px)' }}
                  onClick={() => setShowBrandSelector(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 8 }}
                    className="w-full max-w-xs rounded-2xl p-4"
                    style={{
                      background: 'rgba(18,24,38,0.98)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white">اختر الماركة</h3>
                      <button
                        onClick={() => setShowBrandSelector(false)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <Icon name="XMarkIcon" size={14} className="text-white/50" />
                      </button>
                    </div>
                    <CustomDropdown
                      options={brandOptions}
                      value={selectedBrand}
                      onChange={(value) => {
                        setSelectedBrand(value);
                        setBrandError(false);
                      }}
                      label=""
                      placeholder="اختر الماركة..."
                      error={brandError}
                      errorMessage={
                        brandError ? 'يرجى اختيار الماركة قبل الإضافة للسلة' : undefined
                      }
                      required
                      size="sm"
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setShowBrandSelector(false)}
                        className="flex-1 py-2 rounded-xl text-xs font-medium text-white/50 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => {
                          if (selectedBrand && onAddToCart && inStock) {
                            onAddToCart({ ...product, selectedBrand });
                            triggerFlyingAnimation();
                            setShowBrandSelector(false);
                          }
                        }}
                        disabled={!selectedBrand}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40"
                        style={{
                          background: selectedBrand
                            ? 'linear-gradient(135deg, #059669, #10b981)'
                            : 'rgba(255,255,255,0.08)',
                          boxShadow: selectedBrand ? '0 4px 15px rgba(16,185,129,0.3)' : 'none',
                        }}
                      >
                        أضف للسلة
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── CONTENT ── */}
          <div
            className="flex flex-col flex-1 p-4 gap-3 min-h-[200px] sm:min-h-[220px]"
            style={{
              background: 'linear-gradient(180deg, #0e1623 0%, #0b1120 100%)',
            }}
          >
            {/* Type pill */}
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide"
                style={{
                  background: type.color,
                  color: type.dot,
                  border: `1px solid ${type.dot}30`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: type.dot, boxShadow: `0 0 6px ${type.dot}` }}
                />
                {type.label}
              </span>

              {/* Stock indicator */}
              {inStock && !isFreeContent && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium"
                  style={{ color: '#34d399' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  متوفر
                </span>
              )}
            </div>

            {/* Product name */}
            <Link href={`/product/${product.slug || product.id || product._id}`}>
              <h3
                className="text-sm font-bold leading-snug line-clamp-2 transition-colors duration-300"
                style={{ color: '#e2e8f0' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = type.dot)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#e2e8f0')}
              >
                {product.name}
              </h3>
            </Link>

            {/* Selected brand */}
            {selectedBrand && needsBrandSelection && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit"
                style={{
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.2)',
                }}
              >
                <Icon name="CheckBadgeIcon" size={12} className="text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-300">{selectedBrand}</span>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* ── Divider ── */}
            <div
              className="h-px w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              }}
            />

            {/* ── Price + CTA ── */}
            <div className="flex flex-col gap-2.5">
              {/* Price block */}
              {isFreeContent ? (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit"
                  style={{
                    background: 'rgba(52,211,153,0.12)',
                    color: '#34d399',
                    border: '1px solid rgba(52,211,153,0.25)',
                  }}
                >
                  <Icon name="GiftIcon" size={12} />
                  هدية مع الهاردات
                </span>
              ) : isData && hasDrive ? (
                <span
                  className="text-2xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #34d399, #10b981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  مجاناً
                </span>
              ) : (
                <div className="flex items-end gap-2">
                  <div>
                    <span className="text-xl font-black leading-none" style={{ color: '#f1f5f9' }}>
                      {(isData && (!product.price || product.price === 0) && (product.gbSize ?? 0) > 0
                        ? (product.gbSize! * 0.5)
                        : product.price
                      ).toLocaleString('ar-EG')}
                    </span>
                    <span className="text-xs text-slate-500 font-normal me-1"> جنيه</span>
                  </div>
                  {hasOldPrice && (
                    <span className="text-xs text-slate-600 line-through leading-none mb-0.5">
                      {product.oldPrice?.toLocaleString('ar-EG')}
                    </span>
                  )}
                </div>
              )}

              {/* Brand hint — small inline note, not a box */}
              <div style={{ minHeight: '20px' }}>
                {needsBrandSelection && !selectedBrand && (
                  <p className="flex items-center gap-1 text-[10px] text-amber-400/70 px-1">
                    <Icon name="InformationCircleIcon" size={10} className="flex-shrink-0" />
                    اختر الماركة للمتابعة
                  </p>
                )}
              </div>

              {/* CTA */}
              {(onAddToCart || onAddToDrive) && (
                <>
                  {isFreeContent ? (
                    <Link
                      href="/products?cat=storage"
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
                      style={{
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                      }}
                    >
                      <Icon name="ShoppingBagIcon" size={14} />
                      تسوق وحدات التخزين
                    </Link>
                  ) : isData && hasDrive ? (
                    <button
                      onClick={handleDriveAdd}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
                      style={{
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                      }}
                    >
                      <Icon name="PlusCircleIcon" size={14} />
                      أضف للدرايف
                    </button>
                  ) : (
                    <button
                      onClick={handleAdd}
                      disabled={!inStock}
                      className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97]"
                      style={
                        inStock
                          ? {
                              background: 'linear-gradient(135deg, #059669, #10b981)',
                              color: '#fff',
                              boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(255,255,255,0.25)',
                              cursor: 'not-allowed',
                            }
                      }
                      onMouseEnter={(e) => {
                        if (inStock)
                          (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            '0 6px 24px rgba(16,185,129,0.5)';
                      }}
                      onMouseLeave={(e) => {
                        if (inStock)
                          (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            '0 4px 16px rgba(16,185,129,0.3)';
                      }}
                    >
                      <Icon name="ShoppingCartIcon" size={14} />
                      {!inStock
                        ? 'نفد المخزون'
                        : needsBrandSelection && !selectedBrand
                          ? 'اختر الماركة أولاً'
                          : 'أضف للسلة'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .neumorphic-card {
    width: 100%;
    border-radius: clamp(16px, 4vw, 24px);
    background: linear-gradient(180deg, #0e1623 0%, #0b1120 100%);
    box-shadow:
      20px 20px 60px #0a0e17,
      -20px -20px 60px #121e2f,
      inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }

  .neumorphic-card:hover {
    box-shadow:
      25px 25px 70px #0a0e17,
      -25px -25px 70px #121e2f,
      inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 640px) {
    .neumorphic-card {
      box-shadow:
        10px 10px 30px #0a0e17,
        -10px -10px 30px #121e2f,
        inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    }
  }
`;
