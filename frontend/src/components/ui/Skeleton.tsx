'use client';

import React from 'react';

const skeletonStyles = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  @keyframes skeleton-fade {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.2; }
  }
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      rgba(30, 41, 59, 0.4) 25%, 
      rgba(55, 215, 172, 0.05) 37%, 
      rgba(30, 41, 59, 0.4) 63%
    );
    background-size: 1000px 100%;
    animation: shimmer 1.4s linear infinite;
  }
  .skeleton-fade {
    background-color: rgba(30, 41, 59, 0.6);
    animation: skeleton-fade 2s ease-in-out infinite;
  }
`;

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
  delay?: number;
  animation?: 'shimmer' | 'fade';
  style?: React.CSSProperties;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines,
  delay = 0,
  animation = 'shimmer',
  style = {},
}: SkeletonProps) {
  const combinedStyle: React.CSSProperties = {
    ...style,
    animationDelay: delay ? `${delay}ms` : undefined,
  };
  if (width) combinedStyle.width = typeof width === 'number' ? `${width}px` : width;
  if (height) combinedStyle.height = typeof height === 'number' ? `${height}px` : height;

  const animClass = animation === 'fade' ? 'skeleton-fade' : 'skeleton-shimmer';

  if (variant === 'text' && lines) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${animClass} h-3 rounded-full`}
            style={{
              width: i === lines - 1 ? '60%' : '100%',
              animationDelay: `${delay + i * 100}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  const variantClasses: Record<NonNullable<SkeletonProps['variant']>, string> = {
    text: 'h-3 rounded-full',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-xl',
    card: 'rounded-[2rem]',
  };

  return (
    <div className={`${animClass} ${variantClasses[variant]} ${className}`} style={combinedStyle} />
  );
}

// ─── Ultra-light product card placeholder (lazy mount) ───────────────────────

export function ProductCardSkeletonLite() {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] h-full"
      aria-hidden
    >
      <div className="aspect-[4/3] w-full bg-white/[0.04] animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 w-1/4 rounded bg-white/[0.04] animate-pulse" />
        <div className="h-4 w-full rounded bg-white/[0.04] animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-white/[0.04] animate-pulse" />
        <div className="pt-3 flex items-center justify-between">
          <div className="h-5 w-16 rounded bg-white/[0.04] animate-pulse" />
          <div className="h-10 w-10 rounded-xl bg-white/[0.04] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Below-the-fold section placeholder ────────────────────────────────────────

export function ProductSectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-white/[0.04] animate-pulse" />
        <div className="h-10 w-2/3 max-w-md rounded-lg bg-white/[0.04] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeletonLite key={i} />
        ))}
      </div>
    </div>
  );
}

export function FooterSkeleton() {
  return (
    <footer
      className="border-t border-white/5 bg-[#080C14] py-16"
      aria-hidden
      style={{ minHeight: '280px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-20 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-full rounded bg-white/[0.03] animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-white/[0.03] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-8 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[220px] rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="aspect-[4/3] bg-white/[0.04] animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-white/[0.04] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product Card Skeleton ───────────────────────────────────────────────────

export function ProductCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="bg-white/[0.02] rounded-[2rem] overflow-hidden border border-white/5 backdrop-blur-sm">
      {/* Image Area */}
      <Skeleton
        variant="rectangular"
        className="w-full aspect-square"
        delay={delay}
        style={{ borderRadius: 0 }}
      />

      <div className="p-6 space-y-4">
        {/* Top Meta (Brand/Tag) */}
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="h-2 w-12" delay={delay + 100} />
          <Skeleton variant="circular" className="w-5 h-5" delay={delay + 150} />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Skeleton variant="text" className="h-4 w-full" delay={delay + 200} />
          <Skeleton variant="text" className="h-4 w-2/3" delay={delay + 250} />
        </div>

        {/* Specs Grid Placeholder */}
        <div className="flex gap-2 py-2">
          <Skeleton variant="rectangular" className="h-6 w-14 rounded-lg" delay={delay + 300} />
          <Skeleton variant="rectangular" className="h-6 w-14 rounded-lg" delay={delay + 350} />
        </div>

        {/* Bottom Section (Price + Button) */}
        <div className="pt-4 flex items-center justify-between border-t border-white/5">
          <div className="space-y-1">
            <Skeleton variant="text" className="h-5 w-16" delay={delay + 400} />
            <Skeleton variant="text" className="h-3 w-10 opacity-50" delay={delay + 450} />
          </div>
          <Skeleton variant="rectangular" className="h-12 w-12 rounded-2xl" delay={delay + 500} />
        </div>
      </div>
    </div>
  );
}

// ─── Product Grid Skeleton ───────────────────────────────────────────────────

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} delay={i * 100} />
        ))}
      </div>
    </>
  );
}
