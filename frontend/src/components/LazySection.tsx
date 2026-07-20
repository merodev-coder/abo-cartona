'use client';

import React, { memo, useRef, type ReactNode } from 'react';
import { useIntersection } from '@/hooks/useIntersection';

export interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Reserve space while off-screen to limit layout shift */
  minHeight?: string;
  rootMargin?: string;
  className?: string;
  /** When true, children mount immediately */
  eager?: boolean;
}

const LazySection = memo(function LazySection({
  children,
  fallback = null,
  minHeight = '480px',
  rootMargin = '320px 0px',
  className = '',
  eager = false,
}: LazySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersection(sectionRef, {
    once: true,
    disabled: eager,
    rootMargin,
  });

  return (
    <section
      ref={sectionRef}
      className={className}
      style={!isVisible && minHeight ? { minHeight } : undefined}
    >
      {isVisible ? children : fallback}
    </section>
  );
});

export default LazySection;
