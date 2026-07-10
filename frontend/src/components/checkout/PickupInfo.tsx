'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface PickupInfoProps {
  className?: string;
}

const STORE_INFO = {
  name: 'أبوكرتونةaming Store',
  address: '9 شارع جمال، تقسيم فريد ذكي، حدائق المعصرة، القاهرة',
  coordinates: {
    lat: 30.0444,
    lng: 31.2357
  },
  workingHours: 'يومياً من 12:00 ظهراً إلى 12:00 منتصف الليل',
  googleMapsUrl: 'https://maps.google.com/?q=30.0444,31.2357',
  phone: '01234567890' // Add actual store phone
};

export default function PickupInfo({ className = '' }: PickupInfoProps) {
  const [showMap, setShowMap] = useState(false);

  const handleOpenMaps = () => {
    window.open(STORE_INFO.googleMapsUrl, '_blank');
  };

  const handleShowMap = () => {
    setShowMap(true);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Store Information Card */}
      <div className="bg-surface-secondary rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Icon name="BuildingStorefrontIcon" size={20} className="text-brand-500" />
          </div>
          <h3 className="text-body-lg font-bold text-text-primary font-heading">
            معلومات الاستلام من المحل
          </h3>
        </div>

        {/* Store Address */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-500/5 border border-brand-500/15">
            <Icon name="MapPinIcon" size={18} className="text-brand-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-black text-text-primary mb-1">{STORE_INFO.name}</p>
              <p className="text-xs text-text-muted leading-relaxed">{STORE_INFO.address}</p>
              <button
                onClick={handleOpenMaps}
                className="mt-2 text-xs text-brand-500 font-bold hover:underline flex items-center gap-1"
              >
                <Icon name="MapIcon" size={12} />
                افتح في جوجل ماب
              </button>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <Icon name="ClockIcon" size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-text-primary mb-1">ساعات العمل</p>
              <p className="text-xs text-text-muted">{STORE_INFO.workingHours}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <Icon name="PhoneIcon" size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-text-primary mb-1">للاستفسار</p>
              <p className="text-xs text-text-muted" dir="ltr">{STORE_INFO.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="bg-surface-secondary rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-body-sm font-bold text-text-primary flex items-center gap-2">
            <Icon name="MapIcon" size={16} className="text-brand-500" />
            موقع المحل على الخريطة
          </h4>
          <button
            onClick={handleShowMap}
            className="text-xs text-brand-500 font-bold hover:underline"
          >
            {showMap ? 'إخفاء الخريطة' : 'عرض الخريطة'}
          </button>
        </div>

        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Google Maps iframe */}
            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-border">
              <iframe
                src={`https://maps.google.com/maps?q=${STORE_INFO.coordinates.lat},${STORE_INFO.coordinates.lng}&z=17&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
                title="Abu Cartona Store Location"
              />
            </div>
            
            {/* Map Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleOpenMaps}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500/20 hover:border-brand-500/50 transition-all text-sm font-bold"
              >
                <Icon name="ArrowTopRightOnSquareIcon" size={14} />
                افتح في جوجل ماب
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(STORE_INFO.address);
                  alert('تم نسخ العنوان!');
                }}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-surface-tertiary border border-border text-text-secondary hover:bg-surface-tertiary/80 transition-all text-sm font-bold"
              >
                <Icon name="ClipboardDocumentIcon" size={14} />
                نسخ العنوان
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Benefits Card */}
      <div className="bg-green-500/5 rounded-2xl p-4 border border-green-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="CheckCircleIcon" size={16} className="text-green-400" />
          <h4 className="text-sm font-bold text-green-400">مميزات الاستلام من المحل</h4>
        </div>
        <ul className="space-y-1 text-xs text-green-400">
          <li className="flex items-center gap-2">
            <Icon name="CheckIcon" size={10} className="flex-shrink-0" />
            بدون رسوم شحن
          </li>
          <li className="flex items-center gap-2">
            <Icon name="CheckIcon" size={10} className="flex-shrink-0" />
            بدون دفع عربون مقدم
          </li>
          <li className="flex items-center gap-2">
            <Icon name="CheckIcon" size={10} className="flex-shrink-0" />
            الدفع عند الاستلام
          </li>
          <li className="flex items-center gap-2">
            <Icon name="CheckIcon" size={10} className="flex-shrink-0" />
            فحص المنتج قبل الشراء
          </li>
        </ul>
      </div>
    </div>
  );
}
