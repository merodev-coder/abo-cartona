'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Home, Grid, Phone, Laptop, Database } from 'lucide-react';

interface FloatingNavbarProps {
  cartCount?: number;
}

export default function FloatingNavbar({ cartCount = 0 }: FloatingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/products', label: 'المنتجات' },
    { href: '/about', label: 'من نحن' },
    { href: '/contact', label: 'تواصل معنا' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Navbar - Fixed Full Width with Glassmorphism */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-[100] hidden md:block transition-all duration-300 transform-gpu will-change-transform ${
          isScrolled ? 'py-3' : 'py-4'
        }`}
      >
        <div
          className={`mx-auto max-w-7xl px-6 transition-all duration-300 ${
            isScrolled ? 'px-4' : 'px-6'
          }`}
        >
          <div
            className={`flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300 transform-gpu will-change-transform backdrop-blur-glass bg-base/90 border border-white/10 shadow-lg`}
          >
            {/* Logo with Laptop & Storage Icon */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center gap-1">
                <Laptop className="w-5 h-5 text-[#2ab88a] transition-transform duration-300 group-hover:scale-110" />
                <Database className="w-4 h-4 text-[#2ab88a]/70 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">أبوكرتونة</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group ${
                      isActive(link.href)
                        ? 'text-[#2ab88a] bg-white/5'
                        : 'text-white/70 hover:text-[#2ab88a] hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    <motion.div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-[#2ab88a] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: isActive(link.href) ? 20 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Cart Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/cart"
                className="relative flex items-center gap-2 px-4 py-2 text-white/70 hover:text-[#2ab88a] transition-all duration-300 rounded-full hover:bg-white/5"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#2ab88a] text-[#131429] text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-[100] md:hidden transition-all duration-300 transform-gpu will-change-transform ${
          isScrolled ? 'py-2' : 'py-3'
        }`}
      >
        <div className="mx-4">
          <div
            className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 transform-gpu bg-base/90 backdrop-blur-xl border border-white/10 shadow-lg`}
          >
            {/* Mobile Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-[#2ab88a]" />
              <span className="text-white font-bold text-lg">أبوكرتونة</span>
            </Link>

            {/* Mobile Menu Toggle + Cart */}
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="relative text-white/70 hover:text-[#2ab88a] transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2ab88a] text-[#131429] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/70 hover:text-[#2ab88a] transition-colors p-1"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mx-4 mt-2 bg-base/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl max-w-[calc(100vw-32px)]"
            >
              <div className="flex flex-col p-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl transition-colors text-right ${
                      isActive(link.href)
                        ? 'text-[#2ab88a] bg-white/10'
                        : 'text-white/70 hover:text-[#2ab88a] hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-[99] md:hidden"
      >
        <div className="bg-base/95 backdrop-blur-xl border-t border-white/10">
          <div className="flex items-center justify-around px-4 py-3">
            <Link
              href="/"
              className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-[#2ab88a]' : 'text-white/50 hover:text-[#2ab88a]'}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">الرئيسية</span>
            </Link>

            <Link
              href="/products"
              className={`flex flex-col items-center gap-1 transition-colors ${isActive('/products') ? 'text-[#2ab88a]' : 'text-white/50 hover:text-[#2ab88a]'}`}
            >
              <Grid className="w-5 h-5" />
              <span className="text-xs">المنتجات</span>
            </Link>

            <Link
              href="/contact"
              className={`flex flex-col items-center gap-1 transition-colors ${isActive('/contact') ? 'text-[#2ab88a]' : 'text-white/50 hover:text-[#2ab88a]'}`}
            >
              <Phone className="w-5 h-5" />
              <span className="text-xs">تواصل</span>
            </Link>

            <Link
              href="/cart"
              className={`flex flex-col items-center gap-1 transition-colors relative ${isActive('/cart') ? 'text-[#2ab88a]' : 'text-white/50 hover:text-[#2ab88a]'}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 right-0 w-4 h-4 bg-[#2ab88a] text-[#131429] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="text-xs">السلة</span>
            </Link>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
