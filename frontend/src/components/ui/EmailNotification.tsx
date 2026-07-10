'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Icon from './AppIcon';

interface EmailNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  variant?: 'friendly' | 'formal' | 'tactical';
  autoClose?: boolean;
  duration?: number;
}

const emailTexts = {
  friendly: {
    title: 'نورنا إيميلك! 📧',
    message: 'بعتنا لك كل تفاصيل أوردرك والملفات اللي طلبتها. بص بصة سريعة على الإيميل ولو فيه أي حاجة إحنا معاك على الواتساب.',
    submessage: 'لو لقيت الإيميل في Spam، حطه في Inbox عشان ميضيعش.'
  },
  formal: {
    title: 'تم إرسال التفاصيل',
    message: 'تم إرسال تفاصيل الأوردر إلى بريدك الإلكتروني بنجاح. يرجى مراجعة بريدك الآن.',
    submessage: 'ولا تنسَ تفقد قسم الـ Junk/Spam.'
  },
  tactical: {
    title: 'جاري الإرسال...',
    message: 'جاري إرسال الفاتورة لإيميلك.. تأكد من وصول الرسالة خلال دقائق لتأكيد كافة البيانات.',
    submessage: 'تحقق من بريدك الوارد خلال دقائق.'
  }
};

export default function EmailNotification({ 
  isVisible, 
  onClose, 
  variant = 'friendly',
  autoClose = true,
  duration = 8000
}: EmailNotificationProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, duration]);

  const handleClose = () => {
    setShouldRender(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const text = emailTexts[variant];

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.16, 1, 0.3, 1],
            damping: 25
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Notification Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="relative w-full max-w-md mx-auto"
          >
            {/* Glassmorphism Card */}
            <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-90" />
              
              {/* Animated Gradient Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 via-transparent to-purple-400/10"
                animate={{
                  background: [
                    'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%, rgba(147, 51, 234, 0.1) 100%)',
                    'linear-gradient(225deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%, rgba(147, 51, 234, 0.1) 100%)',
                    'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%, rgba(147, 51, 234, 0.1) 100%)'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Content */}
              <div className="relative p-8">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/70 transition-colors duration-200 group"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
                </button>
                
                {/* Icon Container */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
                >
                  <EnvelopeIcon className="w-8 h-8 text-white" />
                </motion.div>
                
                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-center space-y-4"
                >
                  <h2 className="text-2xl font-bold text-gray-900">
                    {text.title}
                  </h2>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {text.message}
                  </p>
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3 inline-block">
                      {text.submessage}
                    </p>
                  </div>
                </motion.div>
                
                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="mt-8 flex gap-3"
                >
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-200"
                  >
                    حسناً
                  </button>
                  <button
                    onClick={() => window.open('https://mail.google.com', '_blank')}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    فتح الإيميل
                  </button>
                </motion.div>
              </div>
              
              {/* Bottom Accent */}
              <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
