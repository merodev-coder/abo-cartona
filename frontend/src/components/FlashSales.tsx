'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Zap, Flame } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';
import { getApiUrl } from '@/lib/apiConfig';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function FlashSales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({ hours: 24, minutes: 0, seconds: 0 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;

        if (totalSeconds <= 0) {
          return { hours: 24, minutes: 0, seconds: 0 };
        }

        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch flash sale products
  useEffect(() => {
    fetch(getApiUrl('products?discount=true&limit=10'), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products?.slice(0, 8) || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('flash-sales-container');
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="section-padding bg-gradient-to-br from-brand/5 to-transparent">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 rounded-xl bg-brand/20"
            >
              <Flame className="w-6 h-6 text-brand" />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-2 font-readex tracking-tight"
              >
                عروض خاطفة
              </motion.h2>
              <p className="text-text-secondary text-lg">خصومات محدودة الوقت</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <Clock className="w-5 h-5 text-brand" />
            <div className="countdown">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${timeLeft.hours}-${timeLeft.minutes}-${timeLeft.seconds}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-2"
                >
                  <div className="countdown-item">
                    <span className="text-brand font-bold text-xl">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-brand font-bold">:</span>
                  <div className="countdown-item">
                    <span className="text-brand font-bold text-xl">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-brand font-bold">:</span>
                  <div className="countdown-item">
                    <span className="text-brand font-bold text-xl">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Flash Sales Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollContainer('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl glass-card hover:bg-surface-hover transition-colors -translate-x-2 lg:translate-x-0"
          >
            <ArrowLeft className="w-5 h-5 text-brand rotate-180" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollContainer('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl glass-card hover:bg-surface-hover transition-colors translate-x-2 lg:translate-x-0"
          >
            <ArrowLeft className="w-5 h-5 text-brand" />
          </motion.button>

          {/* Products Carousel */}
          <div id="flash-sales-container" className="carousel-track pb-4">
            {isLoading ? (
              // Skeleton loading
              [...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
                >
                  <div className="card product-card">
                    <div className="aspect-square p-4">
                      <div className="w-full h-full skeleton rounded-lg" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 skeleton rounded" />
                      <div className="h-4 skeleton rounded w-3/4" />
                      <div className="h-5 skeleton rounded w-24" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
                >
                  <div className="relative">
                    {/* Flash Sale Badge */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2 z-10 badge-hot"
                    >
                      <Zap className="w-3 h-3" />
                      <span className="text-xs font-bold ml-1">خصم</span>
                    </motion.div>

                    <ProductCard product={product} />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-12">
                <p className="text-text-muted">لا توجد عروض خاطفة حالياً</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/products?sale=true" className="btn-primary text-lg px-8 shadow-glow-md">
              عرض جميع العروض
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
