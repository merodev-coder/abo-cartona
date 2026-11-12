'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const BRAND = '#37D7AC';
const BG = '#080C14';

interface Sparkle {
  left: string;
  top: string;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

interface AmbientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

const useSparkles = (count: number = 28): Sparkle[] =>
  useMemo(() => {
    const items: Sparkle[] = [];
    for (let i = 0; i < count; i++) {
      items.push({
        left: `${Math.random() * 94}%`,
        top: `${Math.random() * 94}%`,
        delay: Math.random() * 6,
        duration: 3.5 + Math.random() * 4.5,
        size: 6 + Math.random() * 11,
        opacity: 0.25 + Math.random() * 0.55,
      });
    }
    return items;
  }, [count]);

const Sparkle = ({ left, top, delay, duration, size, opacity }: Sparkle) => (
  <motion.span
    className="pointer-events-none absolute"
    style={{
      left,
      top,
      width: size,
      height: size,
      display: 'inline-block',
      opacity: 0,
    }}
    animate={{
      opacity: [0, opacity, opacity * 0.6, opacity, 0],
      scale: [0, 1, 0.7, 1.05, 0],
      rotate: [0, 90, 180, 270, 360],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="none"
      stroke={BRAND}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    </svg>
  </motion.span>
);

const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ className = '', children }) => {
  const sparkles = useSparkles(35);
  const midSparkles = useSparkles(12);

  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: BG,
          zIndex: 0,
        }}
      />

      <motion.div
        className="pointer-events-none absolute"
        style={{
          top: '8%',
          right: '10%',
          width: 'clamp(340px, 42vw, 620px)',
          height: 'clamp(340px, 42vw, 620px)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND}18 0%, ${BRAND}0A 32%, ${BRAND}04 58%, transparent 78%)`,
          filter: 'blur(72px)',
          zIndex: 0,
        }}
        animate={{ y: [0, -20, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute"
        style={{
          bottom: '10%',
          left: '8%',
          width: 'clamp(280px, 34vw, 500px)',
          height: 'clamp(280px, 34vw, 500px)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND}16 0%, ${BRAND}0B 36%, ${BRAND}05 60%, transparent 74%)`,
          filter: 'blur(68px)',
          zIndex: 0,
        }}
        animate={{ y: [0, 16, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="pointer-events-none absolute"
        style={{
          top: '44%',
          left: '42%',
          width: 'clamp(220px, 30vw, 440px)',
          height: 'clamp(220px, 30vw, 440px)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND}14 0%, ${BRAND}08 40%, transparent 68%)`,
          filter: 'blur(58px)',
          zIndex: 0,
        }}
        animate={{ y: [0, -12, 0, 8, 0], x: [0, 10, 0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        {sparkles.map((s, i) => (
          <Sparkle key={`sp-${i}`} {...s} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        {midSparkles.map((s, i) => (
          <Sparkle key={`ms-${i}`} {...s} />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          zIndex: 1,
        }}
      />

      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default AmbientBackground;
