'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Laptop, Cpu, Headphones, Monitor, Smartphone, Gamepad2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  productCount: number;
  color: string;
}

const categories: Category[] = [
  {
    id: 'laptops',
    name: ' اللابتوبات',
    slug: 'laptops',
    icon: <Laptop className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
    productCount: 45,
    color: 'from-brand/20 to-brand/10',
  },
  {
    id: 'pc-parts',
    name: 'قطع الكمبيوتر',
    slug: 'pc-parts',
    icon: <Cpu className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
    productCount: 120,
    color: 'from-brand/20 to-brand/10',
  },
  {
    id: 'accessories',
    name: 'اكسسوارات',
    slug: 'accessories',
    icon: <Headphones className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
    productCount: 85,
    color: 'from-brand/20 to-brand/10',
  },
  {
    id: 'monitors',
    name: 'شاشات',
    slug: 'monitors',
    icon: <Monitor className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
    productCount: 32,
    color: 'from-brand/20 to-brand/10',
  },
  {
    id: 'mobile',
    name: 'موبايل',
    slug: 'mobile',
    icon: <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
    productCount: 67,
    color: 'from-brand/20 to-brand/10',
  },
  {
    id: 'data',
    name: 'ألعاب و أفلام',
    slug: 'data',
    icon: <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />,
    productCount: 28,
    color: 'from-brand/20 to-brand/10',
  },
];

// Optimized spring config - lower stiffness for smoother 60FPS
const smoothSpring = {
  type: 'spring' as const,
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

// Memoized category card to prevent re-renders
const CategoryCard = memo(function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      viewport={{ once: true }}
      className="will-change-transform"
    >
      <Link
        href={`/products?category=${category.slug}`}
        className="group flex flex-col items-center gap-3 sm:gap-4"
      >
        {/* Circle - GPU accelerated with simplified hover - Mobile responsive sizing */}
        <motion.div
          whileHover={{
            scale: 1.08,
            rotateY: 5,
          }}
          whileTap={{ scale: 0.95 }}
          transition={smoothSpring}
          className="category-tile relative overflow-hidden will-change-transform touch-target"
          style={{
            width: 'clamp(80px, 22vw, 120px)',
            height: 'clamp(80px, 22vw, 120px)',
            transform: 'translateZ(0)', // Force GPU layer
          }}
        >
          {/* Gradient background - static, no animation */}
          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-50`} />

          {/* Icon - simplified hover effect - Responsive sizing */}
          <div className="category-icon relative z-10 text-text-muted transition-colors duration-200 group-hover:text-brand scale-75 sm:scale-90 md:scale-100">
            {category.icon}
          </div>

          {/* Static glow on hover - CSS only, no framer animation */}
          <div className="absolute inset-0 bg-brand/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </motion.div>

        {/* Label - simplified, no continuous animation */}
        <div className="text-center">
          <h3 className="text-text-primary font-semibold text-sm sm:text-base md:text-lg mb-0.5 transition-colors duration-200 group-hover:text-brand">
            {category.name}
          </h3>
          <p className="text-text-muted text-xs sm:text-sm">{category.productCount} منتج</p>
        </div>
      </Link>
    </motion.div>
  );
});

const CategoryGrid = memo(function CategoryGrid() {
  return (
    <section className="section-padding">
      <div className="section-container">
        {/* Section Header - simplified animations with fluid typography */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16 will-change-transform"
        >
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-3 sm:mb-4 font-readex tracking-tight"
          >
            تسوق حسب الفئة
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto px-4"
          >
            اختر من مجموعتنا المتنوعة من المنتجات عالية الجودة
          </motion.p>
        </motion.div>

        {/* Category Circles - Mobile-first responsive grid: 2 cols on mobile, 3 on tablet, 6 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 place-items-center">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* Bottom CTA - simplified animation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-8 sm:mt-12 lg:mt-16 will-change-transform"
        >
          <Link
            href="/products"
            className="btn-outline text-base sm:text-lg px-6 sm:px-8 inline-block hover:scale-105 active:scale-95 transition-transform duration-200 touch-target"
          >
            عرض جميع الفئات
          </Link>
        </motion.div>
      </div>
    </section>
  );
});

export default CategoryGrid;
