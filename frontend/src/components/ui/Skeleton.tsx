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
