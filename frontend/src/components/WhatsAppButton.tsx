'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  children
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 left-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
    >
      <Icon name="ChatBubbleLeftRightIcon" size={24} />
      {children}
    </motion.a>
  );
}
