'use client';

import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion';
import {
  springSoft,
  springStiff,
  fadeInUp,
  staggerContainer,
  staggerItem,
  scalePop,
  floatUpDown,
  pageEnter,
  glowPulse,
  revealViewport,
} from '@/lib/animations';

/**
 * ScrollReveal - Wraps children in a scroll-triggered fade-up entrance.
 *
 * Usage:
 * <ScrollReveal>
 *   <YourContent />
 * </ScrollReveal>
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  once = true,
  threshold = -100,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  once?: boolean;
  threshold?: number;
}) {
  const reduce = useReducedMotion();
  const offsets: Record<string, { y?: number; x?: number }> = {
    up: { y: 10 },
    down: { y: -10 },
    left: { x: 10 },
    right: { x: -10 },
  };

  const variant: Variants = {
    hidden: {
      opacity: 0,
      ...offsets[direction],
      scale: 0.97,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.24,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      initial={false}
      whileInView="visible"
      viewport={{ once, margin: `${threshold}px` }}
      variants={reduce ? undefined : variant}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerChildren - Container that staggers children on scroll reveal.
 */
export function StaggerReveal({
  children,
  className = '',
  staggerDelay = 0.07,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const customContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial={false}
      whileInView="visible"
      viewport={revealViewport}
      variants={customContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { motion as Motion };

export {
  AnimatePresence,
  springSoft,
  springStiff,
  fadeInUp,
  staggerContainer,
  staggerItem,
  scalePop,
  floatUpDown,
  pageEnter,
  glowPulse,
  revealViewport,
};
