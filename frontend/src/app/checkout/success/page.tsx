'use client';

import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion'; // تأكد من تثبيت framer-motion

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '#AC-XXXXX';
  const total = searchParams.get('total') || '0';
  const deposit = searchParams.get('deposit') || '0';
  const drive = searchParams.get('drive') || '0';

  return (
    <div className="max-w-md w-full text-center px-2">
      {/* Success Animation & Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-24 h-24 rounded-full bg-brand-500/10 border-2 border-brand-500 flex items-center justify-center mx-auto mb-8 animate-pulse-glow shadow-[0_0_20px_rgba(var(--brand-500),0.3)]">
          <Icon name="CheckCircleIcon" size={48} className="text-brand-500" variant="solid" />
        </div>
        <h2 className="text-3xl font-black text-text-primary mb-3">تم تأكيد أوردرك! 🎉</h2>
        <p className="text-text-muted mb-8 leading-relaxed">
          أوردرك اتأكد وبيتجهز دلوقتي. هنتواصل معاك على الموبايل في أقرب وقت لتحديد موعد التوصيل.
        </p>
      </motion.div>

      {/* 📧 Email Notification Section (The New Part) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative overflow-hidden glass-card border-brand-500/30 bg-brand-500/[0.03] rounded-3xl p-5 mb-6 text-right flex items-start gap-4"
      >
        <div className="bg-brand-500/20 p-3 rounded-2xl">
          <Icon name="EnvelopeIcon" size={24} className="text-brand-500" />
        </div>
        <div>
          <h4 className="text-sm font-black text-text-primary mb-1">تفقد بريدك الإلكتروني! 📧</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            بعتنا لك فاتورة الأوردر وتفاصيل ملفات الداتا. لو مش لاقيها، بص بصه سريعة في الـ <span className="text-brand-500 font-bold">Spam</span>.
          </p>
        </div>
        {/* Subtle Decorative Light */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-500/10 blur-3xl rounded-full"></div>
      </motion.div>

      {/* Order Details Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-3xl p-6 text-right mb-8 space-y-4 border-white/5"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-sm text-text-muted font-medium">رقم الأوردر</span>
          <span className="text-sm font-black text-text-primary tracking-wider" dir="ltr">
            {orderId}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-sm text-text-muted font-medium">إجمالي الأوردر</span>
          <span className="text-sm font-black text-text-primary">
            {Number(total).toLocaleString('ar-EG')} جنيه
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-sm text-text-muted font-medium">العربون المدفوع</span>
          <span className="text-sm font-black text-brand-500 flex items-center gap-1">
             <Icon name="CheckIcon" size={14} /> {deposit} جنيه
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted font-medium">ملفات الداتا</span>
          <span className="text-sm font-black text-brand-500 bg-brand-500/10 px-3 py-1 rounded-full text-[10px]">
             {drive} ملف مجاناً 🎁
          </span>
        </div>
      </motion.div>

      
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20 mt-14">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            <div className="text-text-primary font-bold">جاري التحميل...</div>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}