'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Flame } from 'lucide-react';
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

/* ────────── Constants ────────── */

const BRAND_GREEN = '#37D7AC';
const BRAND_GREEN_RGB = '55, 215, 172';

/* ────────── Animated Number Counter ────────── */

const AnimatedCounter = ({
  end,
  suffix = '',
  duration = 2.2,
  decimals = 0,
  prefix = '',
}: {
  end: number;
  suffix?: string;
  duration?: number;
  decimals?: number;
  prefix?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = end * eased;
      el.textContent =
        decimals > 0
          ? `${prefix}${value.toFixed(decimals)}${suffix}`
          : `${prefix}${Math.floor(value).toLocaleString('ar-EG')}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
      else
        el.textContent =
          decimals > 0
            ? `${prefix}${end.toFixed(decimals)}${suffix}`
            : `${prefix}${end.toLocaleString('ar-EG')}${suffix}`;
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration, decimals, prefix, suffix]);

  return <span ref={ref}>{`${prefix}0${suffix}`}</span>;
};

/* ────────── Scroll Progress Bar ────────── */

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none"
      style={{
        scaleX,
        transformOrigin: '0% 50%',
        background: `linear-gradient(90deg, transparent 5%, rgba(${BRAND_GREEN_RGB},0.95) 30%, ${BRAND_GREEN} 50%, rgba(${BRAND_GREEN_RGB},0.95) 70%, transparent 95%)`,
        boxShadow: `0 0 12px rgba(${BRAND_GREEN_RGB},0.45)`,
      }}
    />
  );
};

/* ────────── Section Dividers with Floating Orbs ────────── */

const SectionDivider = ({ index = 0 }: { index?: number }) => {
  const orbPositions = [
    { top: '8%', right: '14%', w: 300, h: 300 },
    { bottom: '10%', left: '10%', w: 250, h: 250 },
    { top: '35%', left: '38%', w: 200, h: 200 },
    { top: '15%', left: '60%', w: 180, h: 180 },
  ];
  const pos = orbPositions[index % orbPositions.length];

  return (
    <div
      className="relative h-28 sm:h-36 w-full overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Vertical gradient line */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-px h-full"
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 1.2,
          ease: [0.22, 0.61, 0.36, 1],
          delay: index * 0.1,
        }}
        style={{
          background: `linear-gradient(180deg, transparent, rgba(${BRAND_GREEN_RGB},0.16), rgba(${BRAND_GREEN_RGB},0.03), transparent)`,
        }}
      />

      {/* Floating large orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '8%',
          right: `${12 + (index % 3) * 5}%`,
          width: pos.w,
          height: pos.h,
          background: `radial-gradient(circle, rgba(${BRAND_GREEN_RGB},0.055) 0%, transparent 70%)`,
          filter: 'blur(32px)',
        }}
        animate={{ y: [0, -18, 0, 8, 0], scale: [1, 1.04, 1, 0.96, 1] }}
        transition={{
          duration: 8 + index,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.5,
        }}
      />

      {/* Tiny orbiting dots */}
      {[0, 1, 2].map((d) => (
        <motion.div
          key={d}
          className="absolute rounded-full"
          style={{
            width: 5,
            height: 5,
            background: `rgba(${BRAND_GREEN_RGB},${0.3 + d * 0.15})`,
            boxShadow: `0 0 ${4 + d * 2}px rgba(${BRAND_GREEN_RGB},${0.15 + d * 0.1})`,
            left: `${28 + d * 22}%`,
            top: `${18 + d * 24}%`,
          }}
          animate={{
            y: [0, -(10 + d * 4), 0],
            x: [0, (d - 1) * 7, 0],
            opacity: [0.15, 0.55, 0.15],
          }}
          transition={{
            duration: 4.5 + d * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: d * 0.5 + index * 0.35,
          }}
        />
      ))}
    </div>
  );
};

/* ────────── Rotating Sale Badge ────────── */

const SaleBadge = () => (
  <motion.div
    animate={{ rotate: [0, 6, -4, 3, 0] }}
    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    className="inline-flex items-center gap-1.5"
  >
    <Flame size={12} strokeWidth={2.5} style={{ color: BRAND_GREEN }} />
    <span
      className="text-[10px] font-extrabold tracking-widest"
      style={{ color: BRAND_GREEN }}
    >
      الأكثر مبيعًا
    </span>
  </motion.div>
);

/* ────────── Enhanced Empty Section ────────── */

const EnhancedEmptySection = ({
  message,
  icon = 'ArchiveBoxIcon',
  href = '/products',
  linkLabel = 'تصفح المنتجات',
}: {
  message: string;
  icon?: string;
  href?: string;
  linkLabel?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.96 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    {/* Decorative ring */}
    <div className="relative mb-6">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(${BRAND_GREEN_RGB},0.08) 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: `rgba(${BRAND_GREEN_RGB},0.08)`,
          border: `1px solid rgba(${BRAND_GREEN_RGB},0.18)`,
        }}
      >
        <Icon
          name={icon as any}
          size={24}
          style={{ color: BRAND_GREEN, opacity: 0.7 }}
        />
      </div>
    </div>
    <p className="text-sm mb-5" style={{ color: 'rgba(148,163,184,0.6)' }}>
      {message}
    </p>
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300"
        style={{
          background: `rgba(${BRAND_GREEN_RGB},0.1)`,
          color: BRAND_GREEN,
          border: `1px solid rgba(${BRAND_GREEN_RGB},0.25)`,
        }}
      >
        {linkLabel}
        <ArrowLeft size={14} strokeWidth={2.5} />
      </Link>
    </motion.div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Enhanced Section Header ─────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

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
      <div className="flex items-start gap-5">
        {/* Animated accent bar */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-1.5 rounded-full flex-shrink-0 mt-3 origin-top"
          style={{
            height: '72px',
            background: `linear-gradient(180deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN}40 50%, transparent 100%)`,
            boxShadow: `0 0 18px rgba(${BRAND_GREEN_RGB},0.35)`,
          }}
        />

        <div className="space-y-3.5">
          {/* Label pill with pulse */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex items-center gap-2"
          >
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase px-4 py-1.5 rounded-full"
              style={{
                background: `rgba(${BRAND_GREEN_RGB},0.1)`,
                color: BRAND_GREEN,
                border: `1px solid rgba(${BRAND_GREEN_RGB},0.25)`,
                boxShadow: `0 2px 10px rgba(${BRAND_GREEN_RGB},0.08)`,
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: BRAND_GREEN, boxShadow: `0 0 8px rgba(${BRAND_GREEN_RGB},0.5)` }}
              />
              {label}
            </span>
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-[2.8rem] font-black text-white tracking-tight leading-[1.12]">
            <span className="block sm:inline">{title} </span>{' '}
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
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="absolute left-0 right-0 bottom-[-6px] h-[3px] rounded-full origin-left"
                style={{
                  background: `linear-gradient(90deg, ${BRAND_GREEN}, rgba(${BRAND_GREEN_RGB},0.55), transparent)`,
                  filter: 'blur(0.5px)',
                }}
              />
              {/* Hover glow */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded"
                style={{
                  background: `rgba(${BRAND_GREEN_RGB},0.12)`,
                  filter: 'blur(16px)',
                }}
              />
            </span>
          </h2>
        </div>
      </div>

      {/* View all link */}
      <AnimatePresence>
        {href && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Link
              href={href}
              className="group relative flex items-center gap-3 text-[13px] font-bold px-6 py-3 rounded-full overflow-hidden transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid rgba(255,255,255,0.08)`,
                color: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, rgba(${BRAND_GREEN_RGB},0.08), transparent)`,
                }}
              />
              <span className="relative z-10">عرض الكل</span>
              <ArrowLeft
                size={15}
                strokeWidth={2.5}
                className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1"
                style={{ color: BRAND_GREEN }}
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Section Wrapper with Parallax ───────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

const SectionWrapper = ({
  children,
  glowSide = 'center',
  className = '',
  showDivider = true,
  dividerIndex = 0,
  sectionIndex = 0,
}: {
  children: React.ReactNode;
  glowSide?: 'left' | 'right' | 'center';
  className?: string;
  showDivider?: boolean;
  dividerIndex?: number;
  sectionIndex?: number;
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.15], [0.96, 1]);
  const y = useTransform(scrollYProgress, [0, 0.15], [40, 0]);

  const glowStyle = {
    left: {
      left: '-180px',
      right: undefined,
      deg: '30%',
    },
    right: {
      left: undefined,
      right: '-180px',
      deg: '70%',
    },
    center: {
      left: '50%',
      right: undefined,
      deg: '50%',
    },
  }[glowSide];

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity, scale, y }}
      className={`relative ${className}`}
    >
      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute top-0 w-[750px] h-[420px]"
        style={{
          ...(glowSide === 'left'
            ? { left: '-180px', right: undefined }
            : glowSide === 'right'
              ? { right: '-180px', left: undefined }
              : { left: '50%', right: undefined, transform: 'translateX(-50%)' }),
          background: `radial-gradient(ellipse at ${(glowSide === 'left' ? 30 : glowSide === 'right' ? 70 : 50)}% 50%, rgba(${BRAND_GREEN_RGB},0.06) 0%, rgba(${BRAND_GREEN_RGB},0.015) 45%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />

      {/* Animated gradient divider */}
      {showDivider && sectionIndex > 0 && (
        <div className="w-full h-px mb-14 pointer-events-none overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            whileInView={{ x: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            className="w-full h-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(${BRAND_GREEN_RGB},0.3) 50%, transparent 100%)`,
            }}
          />
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </motion.section>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Product Grid with Scroll-triggered Stagger ─────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

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
  const gridCols = (() => {
    if (columns === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    if (columns === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2';
  })();

  return (
    <div ref={gridRef} className={`grid ${gridCols} gap-5 md:gap-6`}>
      <AnimatePresence mode="popLayout">
        {items.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.55,
              delay: index * 0.07,
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

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Animated Background Mesh ─────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

const BackgroundMesh = () => {
  const { scrollY } = useScroll();
  const rawY1 = useTransform(scrollY, [0, 1200], [0, 180]);
  const rawY2 = useTransform(scrollY, [0, 1200], [0, -140]);
  const y1 = useSpring(rawY1, { stiffness: 80, damping: 28 });
  const y2 = useSpring(rawY2, { stiffness: 80, damping: 28 });

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      {/* Animated orbs */}
      <motion.div style={{ y: y1 }} className="absolute top-[-12%] left-[-12%] w-[70vw] h-[70vh]">
        <div
          className="w-full h-full"
          style={{
            background: `radial-gradient(circle at center, rgba(${BRAND_GREEN_RGB},0.05) 0%, transparent 58%)`,
          }}
        />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute bottom-[6%] right-[-8%] w-[60vw] h-[60vh]">
        <div
          style={{
            background: `radial-gradient(circle at center, rgba(${BRAND_GREEN_RGB},0.035) 0%, transparent 58%)`,
          }}
        />
      </motion.div>

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.018,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.018,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
};

/* ─── Error State ─────────────────────────────────────────────────────────── */

const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center" dir="rtl">
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{
          background: `rgba(${BRAND_GREEN_RGB},0.08)`,
          border: `1px solid rgba(${BRAND_GREEN_RGB},0.15)`,
        }}
      >
        <Icon name="ExclamationTriangleIcon" size={28} style={{ color: BRAND_GREEN, opacity: 0.7 }} />
      </div>
      <p className="text-slate-400 text-sm mb-5">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-7 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 active:scale-95"
        style={{
          background: `rgba(${BRAND_GREEN_RGB},0.12)`,
          color: BRAND_GREEN,
          border: `1px solid rgba(${BRAND_GREEN_RGB},0.25)`,
        }}
      >
        إعادة المحاولة
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Main Home Page ──────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════════ */

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

  /* ── Data fetching ── */
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

  /* ── Cart handler ── */
  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart({ ...product, createdAt: '', updatedAt: '' } as any);
    },
    [addToCart],
  );

  /* ── Filtered products (memoized) ── */
  const filteredProducts = useMemo(
    () => ({
      data: products.filter((p) => p.type === 'data'),
      sales: products.filter((p) => !!p.isSale),
      laptops: products.filter((p) => p.type === 'laptops'),
      accessories: products.filter((p) => p.type === 'accessories'),
      storage: products.filter((p) => p.type === 'storage'),
    }),
    [products],
  );

  /* ── GSAP ScrollTrigger stagger animations ── */
  useEffect(() => {
    if (loading) return;

    const triggers: ScrollTrigger[] = [];

    Object.values(refs).forEach((ref) => {
      if (!ref.current?.children.length) return;

      const tween = gsap.fromTo(
        ref.current.children,
        { opacity: 0, y: 36, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 86%',
            toggleActions: 'play none none none',
          },
        },
      );

      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, [loading, products.length]);

  /* ══════════════════════════════════════════════════════════════════════ */
  /* ── Error State ── */
  /* ══════════════════════════════════════════════════════════════════════ */
  if (error) return <ErrorState message={error} />;

  /* ══════════════════════════════════════════════════════════════════════ */
  /* ── Main Layout ── */
  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      className="relative min-h-screen selection:bg-[#37D7AC]/25 selection:text-[#37D7AC]"
      dir="rtl"
      style={{ background: '#080C14' }}
    >
      <ScrollProgressBar />
      <BackgroundMesh />
      <Header />

      <main className="relative z-10 pt-14 sm:pt-16">
        {/* ── Hero Section ── */}
        <HeroSection />

        {/* ── Products Sections ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-24 sm:pb-28 lg:pb-36">
          {loading ? (
            <div className="pt-16 pb-8">
              <ProductGridSkeleton count={8} />
            </div>
          ) : (
            <div className="space-y-2">
              {/* ── Digital Content ── */}
              {filteredProducts.data.length > 0 ? (
                <>
                  <SectionWrapper
                    glowSide="center"
                    showDivider={false}
                    sectionIndex={0}
                  >
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
                  <SectionDivider index={0} />
                </>
              ) : (
                <SectionWrapper showDivider={false} sectionIndex={0}>
                  <SectionHeader
                    label="Digital Content"
                    title="ألعاب و أفلام و برامج"
                    accent="مجانية مع الهارد"
                    index={0}
                  />
                  <EnhancedEmptySection
                    message="لا توجد محتوى رقمي متاح حالياً"
                    href="/products"
                    linkLabel="تصفح جميع المنتجات"
                  />
                </SectionWrapper>
              )}

              {/* ── Flash Sales ── */}
              {filteredProducts.sales.length > 0 ? (
                <>
                  <SectionWrapper
                    glowSide="center"
                    showDivider={true}
                    sectionIndex={1}
                  >
                    <SectionHeader
                      label="Exclusive Offers"
                      title="عروض"
                      accent="أبو كرتونة"
                      href="/sales"
                      index={1}
                    />
                    <ProductGrid
                      items={filteredProducts.sales}
                      gridRef={refs.sales}
                      onAddToCart={handleAddToCart}
                    />
                  </SectionWrapper>
                  <SectionDivider index={1} />
                </>
              ) : (
                <SectionWrapper showDivider={false} sectionIndex={1}>
                  <SectionHeader
                    label="Exclusive Offers"
                    title="عروض"
                    accent="أبو كرتونة"
                    index={1}
                  />
                  <EnhancedEmptySection
                    message="لا توجد عروض حالياً — تابعنا للمزيد!"
                    icon="TagIcon"
                    href="/products"
                    linkLabel="تصفح المنتجات"
                  />
                </SectionWrapper>
              )}

              {/* ── Laptops ── */}
              <SectionWrapper glowSide="right" showDivider={false} sectionIndex={2}>
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
                  <EnhancedEmptySection
                    message="لا توجد لابتوبات متاحة حالياً"
                    icon="ComputerDesktopIcon"
                    href="/products?cat=laptops"
                    linkLabel="تصفح اللابتوبات"
                  />
                )}
              </SectionWrapper>
              <SectionDivider index={2} />

              {/* ── Accessories ── */}
              <SectionWrapper glowSide="left" showDivider={false} sectionIndex={3}>
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
                  <EnhancedEmptySection
                    message="لا توجد إكسسوارات متاحة حالياً"
                    icon="CpuChipIcon"
                    href="/products?cat=accessories"
                    linkLabel="تصفح الإكسسوارات"
                  />
                )}
              </SectionWrapper>
              <SectionDivider index={3} />

              {/* ── Storage ── */}
              {filteredProducts.storage.length > 0 && (
                <SectionWrapper
                  glowSide="center"
                  showDivider={false}
                  sectionIndex={4}
                >
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
