'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ProductDetails from '@/components/ProductDetails';

// ─── Main Client Wrapper ─────────────────────────────────────────────────────
export function ProductDetailsClient({ product }: { product: any }) {
  return (
    <motion.div
      className="lg:col-span-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <ProductDetails product={product} variant="full" />
    </motion.div>
  );
}
