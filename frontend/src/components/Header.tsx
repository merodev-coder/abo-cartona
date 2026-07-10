'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useStore } from '@/store/useStore';

const navItems = [
  { label: 'منتجات', href: '/products' },
  { label: 'عروض', href: '/sales' },
];

// ─── Nav Link ────────────────────────────────────────────────────────────────
const NavLink = ({
  href,
  label,
  onClick = () => {},
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative px-4 py-2 text-body-sm font-medium text-white hover:text-brand-400 transition-colors duration-400 block rounded-full group overflow-hidden"
      >
        <motion.span
          className="absolute inset-0 rounded-full bg-surface/60"
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <span className="relative z-10">{label}</span>
        <motion.span
          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-brand to-transparent"
          initial={false}
          animate={{ width: hovered ? '60%' : '0%', opacity: hovered ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </Link>
    </li>
  );
};

const NavItems = ({ onClick = () => {} }: { onClick?: () => void }) => (
  <ul className="flex flex-col md:flex-row gap-1 items-center">
    {navItems.map((item, idx) => (
      <NavLink key={idx} href={item.href} label={item.label} onClick={onClick} />
    ))}
  </ul>
);

// ─── Cart Button ─────────────────────────────────────────────────────────────
const CartButton = ({ cartCount }: { cartCount: number }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 360, damping: 22 });
  const springY = useSpring(y, { stiffness: 360, damping: 22 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.2);
  };

  const resetMouse = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      id="global-cart-icon"
      href="/checkout"
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      className="relative text-white hover:text-brand-400 transition-colors duration-400 p-2.5 rounded-full hover:bg-surface/60 flex items-center justify-center"
    >
      <Icon name="ShoppingCartIcon" size={20} />
      <AnimatePresence mode="popLayout">
        {cartCount > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0, y: 4 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -3 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="absolute -top-0.5 -right-0.5 bg-brand text-midnight text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-glow-sm"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  );
};

// ─── Hamburger ────────────────────────────────────────────────────────────────
function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  if (open === null || open === undefined) return null;
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
      className="text-white hover:text-brand-400 p-2 md:hidden transition-colors duration-400 rounded-full hover:bg-surface/60"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <motion.line
          x1={open ? 4 : 3}
          y1={open ? 4 : 7}
          x2={open ? 18 : 19}
          y2={open ? 18 : 7}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={open ? { x1: 4, y1: 4, x2: 18, y2: 18 } : { x1: 3, y1: 7, x2: 19, y2: 7 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          initial={{ x1: 3, y1: 7, x2: 19, y2: 7 }}
        />
        <motion.line
          x1={open ? 4 : 3}
          y1={open ? 18 : 15}
          x2={open ? 18 : 19}
          y2={open ? 4 : 15}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={open ? { x1: 4, y1: 18, x2: 18, y2: 4 } : { x1: 3, y1: 15, x2: 19, y2: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          initial={{ x1: 3, y1: 15, x2: 19, y2: 15 }}
        />
        <motion.line
          x1={3}
          y1={11}
          x2={19}
          y2={11}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.6, 1] }}
          style={{ originX: '50%', originY: '50%' }}
          initial={{ opacity: 1, scaleX: 1 }}
        />
      </svg>
    </button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartItems } = useStore();
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 30);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/*
        ┌─────────────────────────────────────────────────────────────────┐
        │  KEY FIX: A single wrapper div handles ALL the layout morphing  │
        │  (width, margin, padding) using CSS transitions so every        │
        │  property moves in perfect lockstep — no spring drift.          │
        │                                                                 │
        │  The inner <header> only handles background/border/shadow via   │
        │  CSS transition-colors, which is cheap and instantaneous.       │
        └─────────────────────────────────────────────────────────────────┘
      */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{ perspective: '800px' }}
      >
        {/* Top gradient fade — only visible before scroll */}
        <div
          className="absolute top-0 left-0 right-0 h-28 pointer-events-none transition-opacity duration-500 bg-gradient-to-b from-black/30 dark:from-midnight/95 to-transparent"
          style={{
            opacity: scrolled ? 0 : 1,
          }}
        />

        {/*
          The morphing shell — CSS transition drives width, margin,
          padding, and border-radius all at once from a single
          class toggle. This is the only reliable way to keep
          them perfectly in sync without spring drift.
      {/* Morphing shell with mobile-first responsive width */}
        <div
          className="pointer-events-auto w-full px-2 sm:px-4"
          style={{
            maxWidth: scrolled ? 'min(780px, 95vw)' : '100%',
            width: scrolled ? '96%' : '100%',
            marginTop: scrolled ? '12px' : '0px',
            padding: scrolled ? '0 8px' : '0',
            transition:
              'max-width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), margin-top 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), padding 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <header
            style={{
              borderRadius: scrolled ? '9999px' : '0px',
              transition:
                'border-radius 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
            className={`
            relative flex items-center justify-between overflow-visible
            ${
              scrolled
                ? 'bg-base/90 backdrop-blur-2xl border border-white/10'
                : 'bg-transparent border-b border-white/5'
            }
          `}
          >
            {/* Top shimmer line — only on floating state */}
            <div
              className="absolute inset-x-0 top-0 h-px pointer-events-none transition-opacity duration-400"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)',
                opacity: scrolled ? 1 : 0,
                borderRadius: '9999px',
              }}
            />

            <div className="flex items-center justify-between w-full h-[60px] px-4">
              {/* Logo with breathing animation */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.85, 1],
                  }}
                  transition={{
                    duration: 4,
                    ease: [0.4, 0, 0.6, 1],
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                  whileHover={{
                    scale: 1.06,
                    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  whileTap={{
                    scale: 0.96,
                    transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                >
                  <AppLogo size={40} />
                </motion.div>
                <motion.span
                  className="text-[15px] font-bold text-white tracking-tight hidden sm:block"
                  whileHover={{
                    x: -2,
                    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                >
                  أبوكرتونة
                </motion.span>
              </Link>

              {/* Right side */}
              <div className="flex items-center gap-1 md:gap-6">
                <nav className="hidden md:block">
                  <NavItems />
                </nav>

                <div className="hidden md:block w-px h-5 bg-white/20 rounded-full" />

                <div className="flex items-center gap-0.5">
                  <CartButton cartCount={cartCount} />
                  <HamburgerButton open={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
                </div>
              </div>
            </div>

            {/* Mobile dropdown with brand color #131429 */}
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  className="absolute top-full left-0 right-0 mt-3 mx-2 sm:mx-4 bg-surface-card/95 backdrop-blur-[32px] border border-white/10 rounded-2xl overflow-hidden md:hidden shadow-2xl max-w-[calc(100vw-16px)] box-border"
                >
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />

                  <nav className="p-5 flex flex-col gap-3">
                    {navItems.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: idx * 0.06,
                          type: 'spring',
                          stiffness: 320,
                          damping: 30,
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between w-full px-4 py-3 text-white hover:text-brand-400 font-medium text-body rounded-xl hover:bg-surface/60 transition-all duration-400 group"
                        >
                          <span>{item.label}</span>
                          <Icon
                            name="ChevronLeftIcon"
                            size={16}
                            className="text-white/60 group-hover:text-brand-400 transition-colors duration-400"
                          />
                        </Link>
                      </motion.div>
                    ))}

                    <div className="h-px bg-white/10 mx-2 my-1" />

                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: navItems.length * 0.06 + 0.04,
                        type: 'spring',
                        stiffness: 320,
                        damping: 30,
                      }}
                      className="w-full overflow-hidden"
                    >
                      <Link
                        href="/checkout"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 text-white font-semibold py-3 text-sm touch-target rounded-full px-3"
                        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                      >
                        <Icon name="ShoppingCartIcon" size={15} className="flex-shrink-0" />
                        <span className="truncate whitespace-nowrap">إتمام الشراء</span>
                        {cartCount > 0 && (
                          <span className="bg-base text-brand text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
        </div>
      </div>
    </>
  );
}
