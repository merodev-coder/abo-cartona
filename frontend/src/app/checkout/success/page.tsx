'use client';

import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DepositStatus from '@/components/checkout/DepositStatus';

const BRAND = '#37D7AC';
const BRAND_RGB = '55, 215, 172';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '#AC-XXXXX';
  const total = searchParams.get('total') || '0';
  const deposit = searchParams.get('deposit') || '0';
  const drive = searchParams.get('drive') || '0';

  return (
    <div className="w-full max-w-md text-center px-2">
      {/* Success Animation & Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative mb-8 inline-flex">
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-[-20px] rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(${BRAND_RGB},0.1) 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: `rgba(${BRAND_RGB},0.08)`,
              border: `2px solid rgba(${BRAND_RGB},0.35)`,
              boxShadow: `0 0 40px rgba(${BRAND_RGB},0.12), 0 0 80px rgba(${BRAND_RGB},0.05)`,
            }}
          >
            <Icon name="CheckCircleIcon" size={48} className="text-brand-500" variant="solid" />
          </div>
        </div>

        <h2 className="text-3xl font-black mb-3 leading-tight" style={{ color: '#FFFFFF' }}>
          تم استلام طلبك!
        </h2>
        <p className="text-[13px] leading-[1.85] mb-8" style={{ color: 'rgba(148,163,184,0.6)' }}>
          تم استلام طلبك وإثبات التحويل. يجري مراجعة الدفع قبل تأكيد تجهيز الطلب. هنتواصل معاك على
          الموبايل لاستكمال التفاصيل.
        </p>
      </motion.div>

      <DepositStatus orderID={orderId} />
      {/* Email notification */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl p-5 mb-6 text-right flex items-start gap-4"
        style={{
          background: 'rgba(55,215,172,0.03)',
          border: '1px solid rgba(55,215,172,0.15)',
        }}
      >
        <div
          className="p-2.5 rounded-xl flex-shrink-0"
          style={{
            background: 'rgba(55,215,172,0.08)',
            border: '1px solid rgba(55,215,172,0.12)',
          }}
        >
          <Icon name="EnvelopeIcon" size={20} style={{ color: BRAND }} />
        </div>
        <div>
          <h4 className="text-[13px] font-black text-white mb-1">تفقد بريدك الإلكتروني!</h4>
          <p className="text-[11px] leading-[1.8]" style={{ color: 'rgba(148,163,184,0.6)' }}>
            بعتنا لك فاتورة الأوردر وتفاصيل ملفات الداتا. لو مش لاقيها، بص بصه سريعة في الـ{' '}
            <span className="font-black" style={{ color: BRAND }}>
              Spam
            </span>
            .
          </p>
        </div>
        {/* Decorative glow */}
        <motion.div
          className="absolute -top-10 -right-10 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(${BRAND_RGB},0.08) 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Order details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="rounded-2xl p-5 text-right mb-8"
        style={{
          background: 'rgba(14,20,32,0.5)',
          border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h3
          className="text-[11px] font-extrabold tracking-[0.15em] uppercase mb-4 pb-3"
          style={{
            color: 'rgba(255,255,255,0.4)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          تفاصيل الأوردر
        </h3>
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>
              رقم الأوردر
            </span>
            <span
              className="text-[13px] font-black tracking-wider"
              dir="ltr"
              style={{ color: 'rgba(203,213,225,0.9)' }}
            >
              {orderId}
            </span>
          </div>
          <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>
              إجمالي الأوردر
            </span>
            <span className="text-[13px] font-black" style={{ color: '#FFFFFF' }}>
              {Number(total).toLocaleString('ar-EG')} جنيه
            </span>
          </div>
          <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>
              العربون المدفوع
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-[13px] font-black"
              style={{ color: BRAND }}
            >
              <Icon name="CheckIcon" size={13} />
              {deposit} جنيه
            </span>
          </div>
          <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>
              ملفات الداتا
            </span>
            <span
              className="text-[11px] font-black px-3 py-1 rounded-full"
              style={{
                background: 'rgba(55,215,172,0.1)',
                color: BRAND,
                border: '1px solid rgba(55,215,172,0.2)',
              }}
            >
              {drive} ملف مجاناً
            </span>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-black w-full transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, #059669, #10b981)`,
              color: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
            }}
          >
            تصفح المنتجات
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold w-full transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            الصفحة الرئيسية
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: '#080C14' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            top: '20%',
            left: '15%',
            width: 'clamp(280px, 30vw, 420px)',
            height: 'clamp(280px, 30vw, 420px)',
            background: 'radial-gradient(circle, rgba(55,215,172,0.04) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <Header />
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-24 mt-14">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-12 h-12 rounded-full animate-spin"
                style={{
                  border: '3px solid rgba(55,215,172,0.15)',
                  borderTopColor: BRAND,
                }}
              />
              <p className="text-[13px] font-bold" style={{ color: 'rgba(148,163,184,0.6)' }}>
                جاري التحميل...
              </p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
