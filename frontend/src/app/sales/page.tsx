'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/ui/AppIcon';
import { useStore, type Product } from '@/store/useStore';
import { getApiUrl } from '@/lib/apiConfig';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const { addToCart, addToDrive, driveItems } = useStore();

  const storageInfo = { total: 1000, used: 0, hasDrive: false };

  useEffect(() => {
    fetch(getApiUrl('products?isSale=true'), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        // Filter out data products from sales page
        const filteredProducts = (data.products || []).filter((p: Product) => p.type !== 'data');
        setProducts(filteredProducts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      showNotification(`✓ تمت إضافة "${product.name}" للسلة`);
    },
    [addToCart, showNotification]
  );

  const handleAddToDrive = useCallback(
    (product: Product) => {
      const sizeNum = product.storageCapacity || 0;
      const currentUsed = driveItems.reduce(
        (acc, p) => acc + (p.storageCapacity || 0),
        storageInfo.used
      );
      if (currentUsed + sizeNum > storageInfo.total) {
        showNotification('⚠️ مساحة الهارد مش كفاية لهذا الملف');
        return;
      }
      addToDrive(product);
      showNotification(`✓ تمت إضافة "${product.name}" للدرايف مجاناً`);
    },
    [addToDrive, driveItems, storageInfo, showNotification]
  );

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      <Header />

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 rounded-2xl text-body-sm font-semibold text-text-primary shadow-elevated"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-20 pb-24">
        <div className="bg-surface-secondary/40 border-b border-border mb-8">
          <div className="section-container py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="section-label mb-2">العروض</p>
              <h1 className="text-h1 md:text-display text-text-primary font-heading">
                كل <span className="text-gradient-primary">العروض</span>
              </h1>
            </motion.div>
          </div>
        </div>

        <div className="section-container">
          {loading ? (
            <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card rounded-2xl overflow-hidden">
                  <div className="shimmer w-full aspect-[4/3]" />
                  <div className="p-4 space-y-3">
                    <div className="shimmer h-3 w-20 rounded-md" />
                    <div className="shimmer h-5 w-full rounded-md" />
                    <div className="shimmer h-5 w-3/4 rounded-md" />
                    <div className="flex justify-between pt-2">
                      <div className="shimmer h-6 w-24 rounded-md" />
                      <div className="shimmer h-4 w-12 rounded-md" />
                    </div>
                    <div className="shimmer h-11 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 rounded-3xl glass-card text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
                <Icon name="InboxIcon" size={28} className="text-text-muted" />
              </div>
              <p className="text-h3 font-bold text-text-secondary">لا توجد عروض حالياً</p>
              <p className="text-body-sm text-text-muted mt-2">
                تفقد لاحقاً للحصول على أحدث العروض
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {products.map((p) => (
                <motion.div key={p.id} variants={itemVariants}>
                  <ProductCard
                    product={p}
                    onAddToCart={handleAddToCart}
                    onAddToDrive={handleAddToDrive}
                    hasDrive={storageInfo.hasDrive}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
