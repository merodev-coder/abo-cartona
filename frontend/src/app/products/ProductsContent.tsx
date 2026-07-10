'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductFilters from './components/ProductFilters';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/ui/AppIcon';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSearchParams } from 'next/navigation';
import { useStore, type Product, type Tag } from '@/store/useStore';
import { ThemedSelect } from '@/components/ui/ThemedSelect';

export const dynamic = 'force-dynamic';

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'الأكثر شعبية' },
  { value: 'newest', label: 'الأحدث' },
  { value: 'price-asc', label: 'السعر: من الأقل' },
  { value: 'price-desc', label: 'السعر: من الأعلى' },
];

const tabOptions = [
  { id: 'all', label: 'الكل' },
  { id: 'data', label: 'ألعاب و أفلام' },
  { id: 'storage', label: 'قطع كمبيوتر' },
  { id: 'laptops', label: 'ال اللابتوبات' },
  { id: 'accessories', label: 'الإكسسوارات' },
];

// Optimized animation variants - simpler easing for 60FPS
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const {
    driveItems,
    filters,
    products,
    productsLoading,
    setSearchQuery,
    setCategory,
    toggleTag,
    clearTags,
    addToCart,
    addToDrive,
    fetchProducts,
    fetchTags,
    tags,
  } = useStore();

  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [storage] = useState({ total: 1000, used: 0, hasDrive: false });

  useEffect(() => {
    fetchProducts();
    fetchTags();
  }, [fetchProducts, fetchTags]);

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (!cat) return;
    if (cat === 'laptops') {
      setCategory('laptops');
      setActiveTab('laptops');
    } else if (cat === 'accessories') {
      setCategory('accessories');
      setActiveTab('accessories');
    } else if (cat === 'data') {
      setCategory('data');
      setActiveTab('data');
    } else if (cat === 'storage' || cat === 'hdd' || cat === 'ssd' || cat === 'flash') {
      setCategory('storage');
      setActiveTab('storage');
    } else {
      setCategory('all');
      setActiveTab('all');
    }
    if (['hdd', 'ssd', 'flash'].includes(cat)) {
      clearTags();
      toggleTag(cat);
    }
  }, [searchParams, setCategory, toggleTag, clearTags]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      if (tabId === 'all') setCategory('all');
      else setCategory(tabId as any);
    },
    [setCategory]
  );

  const showNotification = useCallback((msg: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(msg);
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 2500);
  }, []);

  const handleAddToCart = useCallback(
    (product: Product) => {
      try {
        addToCart(product);
        const brandText = product.selectedBrand ? ` (${product.selectedBrand})` : '';
        showNotification(`✓ تمت إضافة "${product.name}${brandText}" للسلة`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('الماركة')) {
          showNotification('⚠️ يرجى اختيار الماركة قبل إضافة المنتج للسلة');
        } else {
          showNotification('⚠️ حدث خطأ أثناء إضافة المنتج للسلة');
        }
      }
    },
    [addToCart, showNotification]
  );

  const handleAddToDrive = useCallback(
    (product: Product) => {
      const sizeNum = product.storageCapacity || 0;
      const currentUsed = driveItems.reduce(
        (acc, p) => acc + (p.storageCapacity || 0),
        storage.used
      );
      if (currentUsed + sizeNum > storage.total) {
        showNotification('⚠️ مساحة الهارد مش كفاية لهذا الملف');
        return;
      }
      addToDrive(product);
      showNotification(`✓ تمت إضافة "${product.name}" للدرايف مجاناً`);
    },
    [addToDrive, driveItems, storage, showNotification]
  );

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    const q = filters.searchQuery.trim().toLowerCase();
    const activeCategory = filters.category;
    const activeTags = filters.tags;
    const [minPrice, maxPrice] = filters.priceRange;

    let filtered = products.filter((p) => {
      // Category filtering
      if (activeCategory && activeCategory !== 'all' && p.type !== activeCategory) {
        return false;
      }

      if (q) {
        const hay = `${p.name} ${p.subtype} ${p.description || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (activeTags.length > 0) {
        const tagSlugs = p.tags.map((t) => t.slug);
        if (!activeTags.some((t) => tagSlugs.includes(t))) return false;
      }
      // Price range filtering
      if (p.price < minPrice || p.price > maxPrice) return false;
      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered = [...filtered].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'popular':
      default:
        filtered = [...filtered].sort((a, b) => {
          if (a.isSale && !b.isSale) return -1;
          if (!a.isSale && b.isSale) return 1;
          if (a.price !== b.price) return b.price - a.price;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return filtered;
  }, [products, sortBy, filters.searchQuery, filters.category, filters.tags, filters.priceRange]);

  return (
    <div className="min-h-screen bg-base">
      <Header />

      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-semibold text-text-primary shadow-lg will-change-transform bg-surface/95 dark:bg-surface-dark/95 border border-border-light dark:border-border-dark"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-20 pb-32">
        {/* Page Header - removed glass-card blur */}
        <div className="border-b border-border bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-sm">
          <div className="section-container py-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-text-secondary text-sm font-medium mb-2 opacity-80">المتجر</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 font-readex tracking-tight">
                  كل المنتجات
                </h1>
              </motion.div>

              {/* Search Bar - fixed overlapping issues */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative max-w-2xl w-full"
              >
                <Icon
                  name="MagnifyingGlassIcon"
                  size={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10"
                />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={filters.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pr-12 pl-4 py-3 text-base w-full rounded-xl bg-surface dark:bg-surface-dark relative"
                />
              </motion.div>
            </div>

            {/* Tag Filters - removed motion animations, simplified hover */}
            {tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
                {tags.slice(0, 8).map((tag: Tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.slug)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 will-change-transform hover:scale-105 active:scale-95 ${
                      filters.tags.includes(tag.slug)
                        ? 'bg-brand text-white shadow-md'
                        : 'bg-surface-secondary dark:bg-surface-dark-secondary text-text-secondary hover:text-brand border border-border-light dark:border-border-dark'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="section-container mt-8">
          <div className="flex gap-8">
            <ProductFilters isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />

            <div className="flex-1 min-w-0">
              {/* Toolbar - simplified animations */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="hidden btn-ghost px-4 py-2.5 font-semibold items-center gap-2 hover:scale-105 active:scale-95 transition-transform duration-200"
                  >
                    <Icon name="FunnelIcon" size={16} />
                    <span>فلاتر</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-sm">عرض</span>
                    <span className="text-brand font-bold text-lg">{filteredProducts.length}</span>
                    <span className="text-text-muted text-sm">منتج</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-sm hidden md:block">ترتيب:</span>
                  <ThemedSelect
                    value={sortBy}
                    onChange={(value) => setSortBy(value as SortOption)}
                    options={sortOptions}
                    className="w-40"
                  />
                </div>
              </div>

              {/* Loading State - static skeleton, no motion animations */}
              {productsLoading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="card product-card animate-pulse">
                      <div className="aspect-square p-4">
                        <div className="w-full h-full skeleton rounded-xl" />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="skeleton h-4 w-20 rounded-md" />
                        <div className="skeleton h-5 w-full rounded-md" />
                        <div className="skeleton h-5 w-3/4 rounded-md" />
                        <div className="flex justify-between pt-2">
                          <div className="skeleton h-6 w-24 rounded-md" />
                          <div className="skeleton h-4 w-12 rounded-md" />
                        </div>
                        <div className="skeleton h-11 w-full rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                /* Empty State - simplified, removed rotation animation */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-24"
                >
                  <div className="w-20 h-20 rounded-2xl bg-surface-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark flex items-center justify-center mx-auto mb-6 will-change-transform">
                    <Icon name="MagnifyingGlassIcon" size={32} className="text-brand" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">مفيش نتائج للبحث ده</h3>
                  <p className="text-text-secondary mb-6">جرب كلمة تانية أو غير الفلاتر</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      handleTabChange('all');
                      clearTags();
                    }}
                    className="btn-secondary hover:scale-105 active:scale-95 transition-transform duration-200"
                  >
                    مسح الفلاتر
                  </button>
                </motion.div>
              ) : (
                /* Product Grid - simplified AnimatePresence */
                <motion.div
                  key={`${activeTab}-${filters.category}-${filters.searchQuery}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={itemVariants}
                      className="will-change-transform"
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onAddToDrive={handleAddToDrive}
                        hasDrive={storage.hasDrive}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default memo(function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-base flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
});
