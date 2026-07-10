'use client';

import React from 'react';
import EmailNotification from '@/components/ui/EmailNotification';
import { useEmailNotification } from '@/hooks/useEmailNotification';

export default function EmailNotificationDemo() {
  const { isVisible, variant, showEmailNotification, hideEmailNotification } = useEmailNotification();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Abu Cartona - Email Notification Demo
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          تجربة مكون إشعار البريد الإلكتروني بتصميم Apple-style مع Glassmorphism
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => showEmailNotification('friendly')}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            🎉 نسخة ودودة
            <br />
            <span className="text-sm opacity-90">مناسب لبراند أبو كارتونة</span>
          </button>
          
          <button
            onClick={() => showEmailNotification('formal')}
            className="px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-900 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            🏢 نسخة رسمية
            <br />
            <span className="text-sm opacity-90">هادئة واحترافية</span>
          </button>
          
          <button
            onClick={() => showEmailNotification('tactical')}
            className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            ⚡ نسخة تكتيكية
            <br />
            <span className="text-sm opacity-90">لمشاكل السيرفر</span>
          </button>
        </div>
        
        <div className="mt-12 p-6 bg-white rounded-xl shadow-lg text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مميزات المكون:</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✨ تصميم Apple-style مع Glassmorphism</li>
            <li>🎭 3 أنماط مختلفة (ودود، رسمي، تكتيكي)</li>
            <li>🎬 رسوم متحركة سلسة باستخدام Framer Motion</li>
            <li>📱 متجاوب بالكامل</li>
            <li>⏱️ إغلاق تلقائي اختياري</li>
            <li>🔗 زر فتح الإيميل المباشر</li>
            <li>🎨 خلفية متحركة وتأثيرات بصرية</li>
          </ul>
        </div>
        
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">كيفية الاستخدام:</h3>
          <pre className="text-sm text-blue-800 bg-blue-100 rounded-lg p-4 overflow-x-auto">
{`import { useEmailNotification } from '@/hooks/useEmailNotification';
import EmailNotification from '@/components/ui/EmailNotification';

function YourComponent() {
  const { showEmailNotification, hideEmailNotification, isVisible, variant } = useEmailNotification();
  
  // Show notification
  showEmailNotification('friendly'); // or 'formal' or 'tactical'
  
  return (
    <>
      <EmailNotification 
        isVisible={isVisible} 
        onClose={hideEmailNotification}
        variant={variant}
        autoClose={true}
        duration={8000}
      />
      {/* Your content */}
    </>
  );
}`}
          </pre>
        </div>
      </div>
      
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
