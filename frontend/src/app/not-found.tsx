'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router?.push('/');
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history?.back();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-surface bg-surface p-4"
      dir="rtl"
    >
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-8">
          <span className="text-[120px] md:text-[160px] font-black leading-none text-gradient-primary select-none">
            404
          </span>
        </div>

        <h2 className="text-h2 font-heading text-text-primary text-text-primary mb-3">
          الصفحة غير موجودة
        </h2>
        <p className="text-body text-text-secondary text-text-secondary mb-8">
          الصفحة اللي بتدور عليها مش موجودة. خلينا نرجعك للمكان الصح!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Icon name="ArrowRightIcon" size={16} />
            ارجع للخلف
          </button>

          <button
            onClick={handleGoHome}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <Icon name="HomeIcon" size={16} />
            الصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
