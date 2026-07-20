'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import WhatsAppButton from '@/components/WhatsAppButton';
import Link from 'next/link';

const BRAND = '#37D7AC';
const BG = '#080C14';

interface StoredOrder {
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    selectedBrand?: string;
  }>;
  driveItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  totalGb: number;
  date: string;
  status: 'Pending' | 'Shipped' | 'Completed' | 'Cancelled';
  customerName: string;
  phone: string;
  address: string;
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  Pending: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', label: 'قيد المراجعة' },
  Shipped: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', label: 'تم الشحن' },
  Completed: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', label: 'مكتمل' },
  Cancelled: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'ملغي' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedOrders = JSON.parse(
      localStorage.getItem('abuKartona_userOrders') || '[]',
    );
    setOrders(storedOrders);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: BG }}>
        <Header />
        <main className="relative z-10 flex-1 pt-14 sm:pt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl h-32"
                  style={{
                    background: 'rgba(14,20,32,0.5)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                />
              ))}
            </div>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: BG }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            top: '5%',
            right: '8%',
            width: 'clamp(300px, 35vw, 500px)',
            height: 'clamp(300px, 35vw, 500px)',
            background: 'radial-gradient(circle, rgba(55,215,172,0.04) 0%, transparent 70%)',
            filter: 'blur(65px)',
          }}
          animate={{ y: [0, -16, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.015,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <Header />

      <main className="relative z-10 flex-1 pt-14 sm:pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-start gap-4 mb-10"
          >
            <div
              className="w-1 rounded-full hidden sm:block"
              style={{
                height: '52px',
                background: `linear-gradient(180deg, ${BRAND} 0%, rgba(55,215,172,0.15) 70%, transparent 100%)`,
                boxShadow: '0 0 14px rgba(55,215,172,0.25)',
              }}
            />
            <div>
              <h1
                className="text-3xl sm:text-[2rem] font-black text-white tracking-tight leading-[1.15]"
              >
                طلباتك
              </h1>
              <p
                className="text-[13px] mt-2"
                style={{ color: 'rgba(148,163,184,0.55)', lineHeight: 1.7 }}
              >
                تتبع جميع طلباتك السابقة والحالية
              </p>
            </div>
          </motion.div>

          {/* Separator */}
          <div className="w-full h-px mb-10 overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="w-full h-full"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(55,215,172,0.2) 50%, transparent)`,
              }}
            />
          </div>

          {/* Orders list */}
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{
                  background: 'rgba(55,215,172,0.06)',
                  border: '1px solid rgba(55,215,172,0.12)',
                }}
              >
                <Icon name="CubeIcon" size={22} style={{ color: BRAND, opacity: 0.5 }} />
              </div>
              <p className="text-[14px] font-bold text-white/50 mb-2">
                لا يوجد طلبات بعد
              </p>
              <p className="text-[12px] mb-6" style={{ color: 'rgba(148,163,184,0.4)' }}>
                قم بعمل طلب من صفحة الشيك آوت وسيظهر هنا
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300"
                  style={{
                    background: 'rgba(55,215,172,0.1)',
                    color: BRAND,
                    border: '1px solid rgba(55,215,172,0.22)',
                  }}
                >
                  تصفح المنتجات
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-4 pb-10">
              {orders.map((order, index) => {
                const status = statusStyles[order.status] || statusStyles.Pending;
                return (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(13,18,28,0.55)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {/* Order header */}
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 p-5"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div>
                        <p
                          className="text-[10px] font-bold tracking-widest uppercase mb-1"
                          style={{ color: 'rgba(148,163,184,0.4)' }}
                        >
                          رقم الطلب
                        </p>
                        <p
                          className="text-[15px] font-black tracking-wider"
                          dir="ltr"
                          style={{ color: 'rgba(203,213,225,0.9)' }}
                        >
                          #{order.orderId}
                        </p>
                      </div>
                      <span
                        className="px-3 py-1.5 rounded-full text-[11px] font-black"
                        style={{
                          background: status.bg,
                          color: status.color,
                          border: `1px solid ${status.color}22`,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Order body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-[12px]">
                        <span style={{ color: 'rgba(148,163,184,0.5)' }}>
                          {new Date(order.date).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="font-black text-[15px]" style={{ color: '#FFFFFF' }}>
                          {order.totalPrice.toLocaleString('ar-EG')} جنيه
                        </span>
                      </div>

                      <div
                        className="p-3.5 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <p
                          className="text-[10px] font-bold tracking-widest uppercase mb-2"
                          style={{ color: 'rgba(148,163,184,0.35)' }}
                        >
                          المنتجات
                        </p>
                        <p
                          className="text-[13px] font-bold leading-relaxed line-clamp-2"
                          style={{ color: 'rgba(203,213,225,0.8)' }}
                        >
                          {order.items
                            .map(
                              (i) =>
                                `${i.name}${i.selectedBrand ? ` (${i.selectedBrand})` : ''}`,
                            )
                            .join(' • ') || '—'}
                        </p>
                      </div>

                      {order.driveItems.length > 0 && (
                        <div
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
                          style={{
                            background: 'rgba(55,215,172,0.05)',
                            border: '1px solid rgba(55,215,172,0.1)',
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center"
                            style={{ background: 'rgba(55,215,172,0.1)' }}
                          >
                            <Icon name="GiftIcon" size={12} style={{ color: BRAND }} />
                          </div>
                          <span
                            className="text-[11px] font-black"
                            style={{ color: BRAND }}
                          >
                            {order.totalGb} GB مجاناً مع الداتا
                          </span>
                        </div>
                      )}

                      {/* Customer info */}
                      <div
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        {[
                          { label: 'الاسم', value: order.customerName },
                          { label: 'الهاتف', value: order.phone },
                          { label: 'العنوان', value: order.address },
                        ].map((info) => (
                          <div key={info.label}>
                            <p
                              className="text-[10px] font-bold tracking-wider uppercase mb-1"
                              style={{ color: 'rgba(148,163,184,0.35)' }}
                            >
                              {info.label}
                            </p>
                            <p
                              className="text-[12px] font-semibold truncate"
                              style={{ color: 'rgba(203,213,225,0.75)' }}
                            >
                              {info.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
