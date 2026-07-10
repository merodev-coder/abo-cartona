'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import WhatsAppButton from '@/components/WhatsAppButton';
import { gsap, ScrollTrigger } from '@/lib/gsapinit';
import { useStore, type Product } from '@/store/useStore';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/ui/AppIcon';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { getApiUrl } from '@/lib/apiConfig';

const BRAND_GREEN = '#37D7AC';

// ─── Enhanced Section Header ────────────────────────────────────────────────

const SectionHeader = ({
  label,
  title,
  accent,
  href,
  index = 0,
}: {
  label: string;
  title: string;
  accent: string;
  href?: string;
  index?: number;
}) => {
  const accentRef = useRef<HTMLSpanElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: index * 0.1,
      }}
      className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 lg:mb-16 gap-4 sm:gap-6"
    >
      <div className="flex items-start gap-6">
        {/* Animated accent bar */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-1.5 rounded-full flex-shrink-0 mt-2 origin-top"
          style={{
            height: '80px',
            background: `linear-gradient(180deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN}40 50%, transparent 100%)`,
            boxShadow: `0 0 20px ${BRAND_GREEN}40`,
          }}
        />

        <div className="space-y-4">
          {/* Label pill with pulse effect */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full backdrop-blur-sm"
              style={{
                background: `${BRAND_GREEN}15`,
                color: BRAND_GREEN,
                border: `1px solid ${BRAND_GREEN}30`,
                boxShadow: `0 2px 8px ${BRAND_GREEN}10`,
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: BRAND_GREEN }}
              />
              {label}
            </span>
          </motion.div>

          {/* Title with character stagger effect */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
            <span className="block sm:inline">{title}</span>{' '}
            <span
              ref={accentRef}
              className="relative inline-block group cursor-default"
              style={{ color: BRAND_GREEN }}
            >
              {accent}
              {/* Animated underline */}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute left-0 right-0 bottom-[-8px] h-[3px] rounded-full origin-left"
                style={{
                  background: `linear-gradient(90deg, ${BRAND_GREEN}, ${BRAND_GREEN}60, transparent)`,
                  filter: 'blur(0.5px)',
                }}
              />
              {/* Hover glow */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: `${BRAND_GREEN}20` }}
              />
            </span>
          </h2>
        </div>
      </div>

      {/* Enhanced View all link */}
      <AnimatePresence>
        {href && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href={href}
              className="group relative flex items-center gap-3 text-sm font-semibold transition-all duration-300 px-6 py-3 rounded-full overflow-hidden bg-white/5 border border-white/10 text-white/90 hover:border-[#37D7AC]/50 hover:text-white"
            >
              {/* Hover background */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${BRAND_GREEN}10, transparent)` }}
              />
              <span className="relative z-10">عرض الكل</span>
              <Icon
                name="ArrowLeftIcon"
                size={16}
                className="relative z-10 group-hover:-translate-x-1.5 transition-transform duration-300"
                style={{ color: BRAND_GREEN }}
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Enhanced Section Wrapper ───────────────────────────────────────────────

const SectionWrapper = ({
  children,
  glowSide = 'left',
  className = '',
}: {
  children: React.ReactNode;
  glowSide?: 'left' | 'right' | 'center';
  className?: string;
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  const glowPosition = {
    left: { left: '-200px', right: undefined, transform: 'translateY(-30%)' },
    right: { left: undefined, right: '-200px', transform: 'translateY(-30%)' },
    center: { left: '50%', right: undefined, transform: 'translateX(-50%) translateY(-30%)' },
  }[glowSide];

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity, scale, y }}
      className={`relative py-20 ${className}`}
    >
      {/* Dynamic ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute top-0 w-[800px] h-[500px]"
        style={{
          ...glowPosition,
          background: `radial-gradient(ellipse at ${glowSide === 'left' ? '30%' : glowSide === 'right' ? '70%' : '50%'} 50%, ${BRAND_GREEN}08 0%, ${BRAND_GREEN}02 40%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Top divider with gradient animation */}
      <div className="w-full h-px mb-20 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ x: '-100%' }}
          whileInView={{ x: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="w-full h-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${BRAND_GREEN}40 50%, transparent 100%)`,
          }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </motion.section>
  );
};

// ─── Enhanced Product Grid ──────────────────────────────────────────────────

const ProductGrid = ({
  items,
  gridRef,
  onAddToCart,
  columns = 4,
}: {
  items: Product[];
  gridRef: React.RefObject<HTMLDivElement | null>;
  onAddToCart: (product: Product) => void;
  columns?: number;
}) => {
  const getGridCols = () => {
    if (columns === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    if (columns === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2';
  };

  return (
    <div ref={gridRef} className={`grid ${getGridCols()} gap-6 md:gap-8`}>
      <AnimatePresence mode="popLayout">
        {items.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="will-change-transform"
          >
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ─── Enhanced Background Mesh ─────────────────────────────────────────────────

const BackgroundMesh = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {/* Animated orbs */}
      <motion.div
        style={{ y: springY1 }}
        className="absolute top-[-15%] left-[-15%] w-[70vw] h-[70vh]"
      >
        <div
          className="w-full h-full animate-pulse"
          style={{
            background: `radial-gradient(circle at center, ${BRAND_GREEN}06 0%, transparent 60%)`,
            animationDuration: '8s',
          }}
        />
      </motion.div>

      <motion.div
        style={{ y: springY2 }}
        className="absolute bottom-[5%] right-[-10%] w-[60vw] h-[60vh]"
      >
        <div
          style={{
            background: `radial-gradient(circle at center, ${BRAND_GREEN}04 0%, transparent 60%)`,
          }}
        />
      </motion.div>

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Refined grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
};

// ─── Empty State Component ───────────────────────────────────────────────────

const EmptySection = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
      style={{ background: `${BRAND_GREEN}10`, border: `1px solid ${BRAND_GREEN}20` }}
    >
      <Icon name="ArchiveBoxIcon" size={24} style={{ color: BRAND_GREEN }} />
    </div>
    <p className="text-white/50 text-sm">{message}</p>
  </motion.div>
);

// ─── Main Page Component ────────────────────────────────────────────────────

export default function HomePage() {
  const { addToCart } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refs = {
    data: useRef<HTMLDivElement>(null),
    sales: useRef<HTMLDivElement>(null),
    laptops: useRef<HTMLDivElement>(null),
    accessories: useRef<HTMLDivElement>(null),
    storage: useRef<HTMLDivElement>(null),
  };

  // Optimized data fetching with error handling
  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = getApiUrl('products');

    fetch(apiUrl, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Unable to load products');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart({ ...product, createdAt: '', updatedAt: '' } as any);
    },
    [addToCart]
  );

  // Memoized filtered products
  const filteredProducts = React.useMemo(
    () => ({
      data: products.filter((p) => p.type === 'data'),
      sales: products.filter((p) => !!p.isSale),
      laptops: products.filter((p) => p.type === 'laptops'),
      accessories: products.filter((p) => p.type === 'accessories'),
      storage: products.filter((p) => p.type === 'storage'),
    }),
    [products]
  );

  // GSAP ScrollTrigger cleanup
  useEffect(() => {
    if (loading) return;

    const triggers: ScrollTrigger[] = [];

    Object.values(refs).forEach((ref) => {
      if (!ref.current?.children.length) return;

      const tween = gsap.fromTo(
        ref.current.children,
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, [loading, products.length]);

  if (error) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ background: `${BRAND_GREEN}20`, color: BRAND_GREEN }}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-base selection:bg-[#37D7AC]/30 selection:text-[#37D7AC]"
      dir="rtl"
    >
      <BackgroundMesh />
      <Header />

      <main className="relative z-10 pt-16">
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-32">
          {loading ? (
            <div className="pt-20">
              <ProductGridSkeleton count={8} />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Data Section - Games, Movies, etc. */}
              {filteredProducts.data.length > 0 ? (
                <SectionWrapper glowSide="center">
                  <SectionHeader
                    label="Digital Content"
                    title="ألعاب و أفلام و برامج"
                    accent="مجانية مع الهارد"
                    href="/products?cat=data"
                    index={0}
                  />
                  <ProductGrid
                    items={filteredProducts.data.slice(0, 8)}
                    gridRef={refs.data}
                    onAddToCart={handleAddToCart}
                  />
                </SectionWrapper>
              ) : (
                <SectionWrapper glowSide="center">
                  <SectionHeader label="Digital Content" title="ألعاب و أفلام و برامج" accent="مجانية مع الهارد" />
                  <EmptySection message="لا توجد محتوى رقمي متاح حالياً" />
                </SectionWrapper>
              )}

              {/* Sales Section */}
              {filteredProducts.sales.length > 0 ? (
                <SectionWrapper glowSide="center">
                  <SectionHeader
                    label="Exclusive Offers"
                    title="عروض"
                    accent="أبوكرتونة"
                    index={1}
                  />
                  <ProductGrid
                    items={filteredProducts.sales}
                    gridRef={refs.sales}
                    onAddToCart={handleAddToCart}
                  />
                </SectionWrapper>
              ) : (
                <SectionWrapper glowSide="center">
                  <SectionHeader label="Exclusive Offers" title="عروض" accent="أبوكرتونة" />
                  <EmptySection message="لا توجد عروض حالياً" />
                </SectionWrapper>
              )}

              {/* Laptops Section */}
              <SectionWrapper glowSide="right">
                <SectionHeader
                  label="Laptops"
                  title="أحدث"
                  accent="اللابتوبات"
                  href="/products?cat=laptops"
                  index={2}
                />
                {filteredProducts.laptops.length > 0 ? (
                  <ProductGrid
                    items={filteredProducts.laptops.slice(0, 8)}
                    gridRef={refs.laptops}
                    onAddToCart={handleAddToCart}
                  />
                ) : (
                  <EmptySection message="لا توجد  اللابتوبات متاحة" />
                )}
              </SectionWrapper>

              {/* Accessories Section */}
              <SectionWrapper glowSide="left">
                <SectionHeader
                  label="Accessories"
                  title="إكسسوارات"
                  accent="احترافية"
                  href="/products?cat=accessories"
                  index={3}
                />
                {filteredProducts.accessories.length > 0 ? (
                  <ProductGrid
                    items={filteredProducts.accessories.slice(0, 8)}
                    gridRef={refs.accessories}
                    onAddToCart={handleAddToCart}
                  />
                ) : (
                  <EmptySection message="لا توجد إكسسوارات متاحة" />
                )}
              </SectionWrapper>

              {/* Storage Section */}
              {filteredProducts.storage.length > 0 && (
                <SectionWrapper glowSide="center">
                  <SectionHeader
                    label="Storage"
                    title="وحدات"
                    accent="التخزين"
                    href="/products?cat=storage"
                    index={4}
                  />
                  <ProductGrid
                    items={filteredProducts.storage.slice(0, 4)}
                    gridRef={refs.storage}
                    onAddToCart={handleAddToCart}
                    columns={4}
                  />
                </SectionWrapper>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}