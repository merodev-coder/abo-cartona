'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface WhatsAppButtonProps {
  className?: string;
  phoneNumber?: string;
  message?: string;
  children?: React.ReactNode;
}

export default function WhatsAppButton({
  className = '',
  phoneNumber = '201067957449',
  message = 'مرحباً، أريد الاستفسار عن منتجاتكم',
  children,
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 left-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 ${className}`}
      aria-label="تواصل عبر واتساب"
    >
      <Icon name="ChatBubbleLeftRightIcon" size={24} />
      {children}
    </a>
  );
}
