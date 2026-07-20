'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/ProductCard';
import { useStore, type Product } from '@/store/useStore';
import { getApiUrl } from '@/lib/apiConfig';
import Link from 'next/link';

const BRAND = 'rgba(55,215,172,1)';
const BRAND_HEX = '#37D7AC';

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, addToDrive, driveItems } = useStore();

  useEffect(() => {
    fetch(getApiUrl('products?isSale=true'), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const filtered = (data.products || []).filter((p: Product) => p.type !== 'data');
        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: '#080C14' }}>
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 80% 10%, rgba(55,215,172,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          opacity: 0.012,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-px z-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(55,215,172,0.3) 50%, transparent)' }} />

      <Header />

      <main className="relative z-10 pt-20 pb-24">
        {/* Page header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-8 sm:pt-12 mb-8">
          <div className="flex items-start gap-4">
            <div
              aria-hidden="true"
              className="w-1 rounded-full mt-2 origin-top hidden sm:block"
              style={{
                height: '52px',
                background: `linear-gradient(180deg, ${BRAND_HEX} 0%, rgba(55,215,172,0.1) 70%, transparent 100%)`,
                boxShadow: '0 0 10px rgba(55,215,172,0.2)',
              }}
            />
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full mb-2.5"
                style={{
                  background: 'rgba(55,215,172,0.07)',
                  color: BRAND_HEX,
                  border: '1px solid rgba(55,215,172,0.18)',
                }}
              >
                Exclusive Offers
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                عروض{' '}
                <span style={{ color: BRAND_HEX }} className="relative">
                  أبو كرتونة
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-[-5px] h-[3px] rounded-full"
                    style={{ background: `linear-gradient(90deg, ${BRAND_HEX}, rgba(55,215,172,0.2), transparent)` }}
                  />
                </span>
              </h1>
              <p className="text-[13px] mt-2 max-w-lg" style={{ color: 'rgba(148,163,184,0.5)', lineHeight: 1.7 }}>
                خصومات حصرية لفترة محدودة — اغتنم الفرصة الآن قبل انتهاء الكمية
              </p>
            </div>
          </div>
        </div>

        {/* Gradient separator */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 mb-10">
          <div className="w-full h-px overflow-hidden">
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(55,215,172,0.2) 50%, transparent)',
                animation: 'shimmer-sweep 3s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Products grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-24">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(14,22,35,0.6)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="w-full aspect-[4/3]" style={{ background: 'linear-gradient(135deg, #0d1420, #141e2e)' }} />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-20 rounded-md animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    <div className="h-4 w-full rounded-md animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-4 w-3/4 rounded-md animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-10 w-full rounded-xl mt-2" style={{ background: 'rgba(55,215,172,0.06)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{
                  background: 'rgba(55,215,172,0.06)',
                  border: '1px solid rgba(55,215,172,0.12)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BRAND_HEX} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <p className="text-[14px] font-bold text-white/50 mb-2">لا توجد عروض حالياً</p>
              <p className="text-[12px] mb-6" style={{ color: 'rgba(148,163,184,0.4)' }}>
                تابعنا باستمرار للحصول على أحدث العروض والخصومات
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(55,215,172,0.1)',
                  color: BRAND_HEX,
                  border: '1px solid rgba(55,215,172,0.22)',
                }}
              >
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="product-card-enter"
                  style={{
                    animationDelay: `${index * 0.07}s`,
                    animationDuration: '0.45s',
                    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    animationFillMode: 'both',
                  }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={() => addToCart(product)}
                    onAddToDrive={() => addToDrive(product)}
                    hasDrive={product.type === 'data' || product.type === 'storage'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
