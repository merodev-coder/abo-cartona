'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Laptop, HardDrive, Cpu, Zap, ArrowLeft, ShoppingCart, Gauge, Layers } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface HeroProps {
  storage?: {
    total: number;
    used: number;
    hasDrive: boolean;
  };
}

// ─── Optimized Animation Config ─────────────────────────────────────────────
// Lower stiffness = smoother 60FPS on mobile
const springTransition = {
  type: 'spring' as const,
  stiffness: 150,
  damping: 25,
  mass: 0.8,
};

// ─── Breakpoint Hook ───────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setBp('mobile');
      else if (w < 1024) setBp('tablet');
      else setBp('desktop');
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  return bp;
}

// ─── Components ────────────────────────────────────────────────────────────

const BentoCard = memo(function BentoCard({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springTransition, delay }}
      className={`
        relative overflow-hidden rounded-3xl
        bg-surface-dark-secondary/80
        border border-border-dark
        shadow-card-dark
        will-change-transform
        hover:shadow-card-dark-hover
        transition-shadow duration-300
        ${colSpan === 2 ? 'col-span-2' : ''}
        ${rowSpan === 2 ? 'row-span-2' : ''}
        ${className}
      `}
    >
      {/* Subtle gradient highlight - static */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
});

const FeatureIcon = memo(function FeatureIcon({
  icon: Icon,
  color = 'brand',
}: {
  icon: typeof Laptop;
  color?: 'brand' | 'secondary' | 'accent';
}) {
  const colorClasses = {
    brand: 'bg-brand-500/20 text-brand-400',
    secondary: 'bg-secondary-500/20 text-secondary-400',
    accent: 'bg-accent-500/20 text-accent-400',
  };

  return (
    <div
      className={`
        w-12 h-12 rounded-2xl flex items-center justify-center
        will-change-transform
        ${colorClasses[color]}
      `}
    >
      <Icon size={24} strokeWidth={2} />
    </div>
  );
});

// Optimized glow effect - reduced blur intensity
const GlowEffect = memo(function GlowEffect({
  color = 'brand',
  position = 'top-right',
}: {
  color?: 'brand' | 'secondary';
  position?: 'top-right' | 'bottom-left';
}) {
  const colorMap = {
    brand: 'bg-brand-500/20',
    secondary: 'bg-secondary-500/20',
  };

  const positionClasses = {
    'top-right': '-top-20 -right-20',
    'bottom-left': '-bottom-20 -left-20',
  };

  return (
    <div
      className={`
        absolute ${positionClasses[position]} w-40 h-40 rounded-full
        ${colorMap[color]} blur-[40px] pointer-events-none will-change-transform
      `}
    />
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────
const HeroSection = memo(function HeroSection({ storage }: HeroProps) {
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-surface-dark transform-gpu"
      dir="rtl"
    >
      {/* ─── Background ───────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-dark via-surface-dark-secondary to-surface-dark" />

        {/* Optimized orbs - reduced blur, CSS only */}
        <div
          className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-brand-500/15 blur-[60px]"
          style={{ animation: 'pulse-slow 8s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[350px] h-[350px] rounded-full bg-secondary-500/10 blur-[50px]"
          style={{ animation: 'pulse-slow 12s ease-in-out infinite 2s' }}
        />

        {/* Simplified noise texture - using CSS pattern instead of SVG filter */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ─── Content ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-24 lg:py-32">
        <div
          className={`grid items-center gap-8 lg:gap-16 ${
            isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'
          }`}
        >
          {/* ─── Left: Text Content ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springTransition}
            className="will-change-transform"
          >
            {/* Badge - simplified animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6 will-change-transform"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm font-bold">
                <Zap size={14} className="fill-brand-400" />
                أسرع قطع هاردوير في مصر
              </span>
            </motion.div>

            {/* Massive Headline */}
            <h1 className="mb-6">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTransition, delay: 0.15 }}
                className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-text-dark-primary leading-[1.1] tracking-tight pb-[15px]"
              >
                طور جهازك
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTransition, delay: 0.2 }}
                className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight"
              >
                <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent">
                  بأقصى سرعة
                </span>
              </motion.span>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...springTransition, delay: 0.25 }}
              className="text-lg lg:text-xl text-text-dark-secondary max-w-lg mb-8 leading-relaxed"
            >
              متخصصون في اللابتوبات ، SSD فائق السرعة، HDD بسعات ضخمة، رامات عالية الأداء، وكل ما
              يخص تطوير الأجهزة.
            </motion.p>

            {/* CTA Buttons - simplified animation, reduced shadow complexity */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-10 will-change-transform"
            >
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 will-change-transform"
              >
                <ShoppingCart size={20} />
                تسوق القطع الآن
                <ArrowLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform duration-300"
                />
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.35 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { value: '100%', label: 'قطع أصلية' },
                { value: '+5K', label: 'عميل سعيد' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl lg:text-3xl font-black text-brand-400">{stat.value}</p>
                  <p className="text-sm text-text-dark-muted">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ─── Right: Bento Grid ────────────────────────────────────────── */}
          {!isMobile && (
            <div className="grid grid-cols-2 gap-4 lg:gap-5 h-[500px] lg:h-[600px]">
              {/* Main Laptop Card - Large */}
              <BentoCard colSpan={2} rowSpan={1} delay={0.2} className="p-6 lg:p-8">
                <GlowEffect color="brand" position="top-right" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <FeatureIcon icon={Laptop} color="brand" />
                    <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold">
                      الأكثر مبيعاً
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-black text-text-dark-primary mb-2">
                      اللابتوبات
                    </h3>
                  </div>
                </div>
              </BentoCard>

              {/* SSD Card */}
              <BentoCard delay={0.3} className="p-5 lg:p-6">
                <GlowEffect color="secondary" position="bottom-left" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <FeatureIcon icon={Gauge} color="secondary" />
                  <div>
                    <h3 className="text-lg font-black text-text-dark-primary mb-1">NVMe SSD</h3>
                    <p className="text-text-dark-muted text-sm">7000 MB/s</p>
                    <p className="text-brand-400 text-xs font-bold mt-2">أداء خارق</p>
                  </div>
                </div>
              </BentoCard>

              {/* Storage Card */}
              <BentoCard delay={0.35} className="p-5 lg:p-6">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <FeatureIcon icon={HardDrive} color="brand" />
                  <div>
                    <h3 className="text-lg font-black text-text-dark-primary mb-1">HDD & SSD</h3>
                    <p className="text-text-dark-muted text-sm">حتى 4TB</p>
                    <p className="text-brand-400 text-xs font-bold mt-2">سعات ضخمة</p>
                  </div>
                </div>
              </BentoCard>

              {/* RAM Card */}
              <BentoCard delay={0.4} className="p-5 lg:p-6">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <FeatureIcon icon={Cpu} color="accent" />
                  <div>
                    <h3 className="text-lg font-black text-text-dark-primary mb-1">DDR4 / DDR5</h3>
                    <p className="text-text-dark-muted text-sm">حتى 64GB</p>
                    <p className="text-accent-400 text-xs font-bold mt-2">سرعة فائقة</p>
                  </div>
                </div>
              </BentoCard>

              {/* Accessories / CTA Card */}
              <BentoCard
                delay={0.45}
                className="p-5 lg:p-6 bg-gradient-to-br from-brand-500/20 to-brand-600/10 border-brand-500/30"
              >
                <Link
                  href="/products"
                  className="relative z-10 h-full flex flex-col justify-between group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center transform-gpu will-change-transform group-hover:scale-110 transition-transform duration-300">
                    <Layers size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-text-dark-primary mb-1">كل القطع</h3>
                    <p className="text-brand-400 text-sm font-bold flex items-center gap-1">
                      تصفح المنتجات
                      <ArrowLeft
                        size={14}
                        className="group-hover:-translate-x-1 transition-transform"
                      />
                    </p>
                  </div>
                </Link>
              </BentoCard>
            </div>
          )}

          {/* Mobile: Simple cards instead of bento - reduced backdrop blur */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.3 }}
              className="grid grid-cols-2 gap-3 will-change-transform"
            >
              {[
                { icon: Laptop, label: ' اللابتوبات', color: 'text-brand-400' },
                { icon: HardDrive, label: 'قطع كمبيوتر', color: 'text-secondary-400' },
                { icon: Cpu, label: 'رامات', color: 'text-accent-400' },
                { icon: Zap, label: 'اكسسوارات', color: 'text-brand-400' },
              ].map((item, i) => (
                <Link
                  key={i}
                  href="/products"
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-dark-secondary/80 border border-border-dark active:scale-95 transition-transform"
                >
                  <item.icon size={28} className={item.color} />
                  <span className="text-sm font-bold text-text-dark-primary">{item.label}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── Bottom Gradient ──────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-dark to-transparent pointer-events-none z-10" />

      {/* ─── Global Styles ─────────────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
      `}</style>
    </section>
  );
});

export default HeroSection;