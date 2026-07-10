'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EmailNotification from '@/components/ui/EmailNotification';
import { useEmailNotification } from '@/hooks/useEmailNotification';
import Icon from '@/components/ui/AppIcon';

interface OrderCompletionProps {
  orderId: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
}

export default function OrderCompletion({ 
  orderId, 
  customerEmail, 
  customerName, 
  totalAmount 
}: OrderCompletionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const { showEmailNotification, hideEmailNotification, isVisible, variant } = useEmailNotification();

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show email notification after order is processed
      showEmailNotification('friendly');
      setOrderCompleted(true);
    } catch (error) {
      console.error('Order completion error:', error);
      showEmailNotification('tactical');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"
            >
              <Icon name="CheckCircleIcon" size={40} className="text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {orderCompleted ? 'تم تأكيد طلبك!' : 'تأكيد الطلب'}
            </h1>
            
            <p className="text-gray-600">
              {orderCompleted 
                ? 'تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني'
                : 'اضغط لتأكيد الطلب وإرسال التفاصيل إلى بريدك الإلكتروني'
              }
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الطلب</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">رقم الطلب:</span>
                <span className="font-medium text-gray-900">#{orderId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">العميل:</span>
                <span className="font-medium text-gray-900">{customerName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">البريد الإلكتروني:</span>
                <span className="font-medium text-gray-900">{customerEmail}</span>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">الإجمالي:</span>
                <span className="text-lg font-bold text-green-600">{totalAmount} جنيه</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!orderCompleted && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCompleteOrder}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>جاري معالجة الطلب...</span>
                </div>
              ) : (
                'تأكيد الطلب وإرسال الإيميل'
              )}
            </motion.button>
          )}

          {orderCompleted && (
            <div className="text-center space-y-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 font-medium">
                  ✅ تم إرسال تفاصيل الفاتورة والملفات إلى بريدك الإلكتروني
                </p>
                <p className="text-green-600 text-sm mt-1">
                  إذا لم تستلم الإيميل خلال 5 دقائق، تحقق من قسم Spam
                </p>
              </div>
              
              <button
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200"
              >
                فتح Gmail
              </button>
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">ملاحظات هامة:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• ستصلك تفاصيل الطلب والفاتورة على بريدك الإلكتروني خلال دقائق</li>
            <li>• إذا لم تجد الإيميل في الوارد، تحقق من قسم Spam أو Junk</li>
            <li>• يمكنك التواصل معنا عبر الواتساب لأي استفسارات</li>
            <li>• يتم تحضير طلبك خلال 24-48 ساعة</li>
          </ul>
        </motion.div>
      </div>

      {/* Email Notification Component */}
      <EmailNotification 
        isVisible={isVisible} 
        onClose={hideEmailNotification}
        variant={variant}
        autoClose={true}
        duration={8000}
      />
    </div>
  );
}
