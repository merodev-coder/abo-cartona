'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
  showAgreeButton?: boolean;
}

export default function TermsOfServiceModal({
  isOpen,
  onClose,
  onAgree,
  showAgreeButton = false,
}: TermsOfServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
          backdropFilter: 'blur(20px)',
        }}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Icon name="ShieldCheckIcon" size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">شروط الخدمة</h2>
              <p className="text-xs text-text-muted">Terms of Service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Icon name="XMarkIcon" size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Warning Section */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-amber-400 font-bold mb-2">تنويه هام</h3>
                <p className="text-sm text-text-primary leading-relaxed">
                  احنا مسؤلين مسؤليه كامله بالتعويض استبدالا في حاله ضرر المنتج اثناء الشحن ودا بيتم في مده اقصاها 14 يوم 👌
                </p>
                <p className="text-sm text-red-400 mt-2 font-bold">
                  لكن علشان دا يتم حضرتك تصور فيديو للمنتج قبل فتح الكارتونه 👀
                </p>
                <p className="text-sm text-amber-400 mt-1">
                  ودا الضامن الوحيد لحق حضرتك والا يبقا ضيعت حقك 😃
                </p>
              </div>
            </div>
          </div>

          {/* Q&A Sections */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-400 text-xs">✅</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">المدة التي يحتاجها العميل لإرجاع السلعة في حالة السماح بالإرجاع؟</h4>
                <p className="text-sm text-text-muted mt-1">⏺️ 3 ايام</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-400 text-xs">✅</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">في أي حالة يمكن إرجاع العناصر؟</h4>
                <p className="text-sm text-text-muted mt-1">⏺️ بنفس الحاله</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-400 text-xs">✅</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">كيف سأسترد أموالي؟</h4>
                <p className="text-sm text-text-muted mt-1">⏺️ عن طريق المحافظ الالكترونيه او التحويلات البنكيه</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-400 text-xs">✅</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">هل المرتجعات مجانية أم سيتم تطبيق رسوم؟</h4>
                <p className="text-sm text-text-muted mt-1">⏺️ رسوم الاسترجاع تختلف من مكان لاخر راسلنا واتس اب</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-400 text-xs">✅</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">كيف يعمل الاستبدال؟</h4>
                <p className="text-sm text-text-muted mt-1">⏺️ عن طريق ارسال العميل للمنتج وارسال منتج بديل له</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-400 text-xs">✅</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">المنتجات الغير قابله للارجاع؟</h4>
                <p className="text-sm text-text-muted mt-1">⏺️ التالفه</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-400 text-xs">✅</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">كيف يتم إرجاع عنصر؟</h4>
                <p className="text-sm text-text-muted mt-1">⏺️ عن طريق ارساله مع اي مندوب</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with agree button */}
        {showAgreeButton && (
          <div className="p-6 border-t border-white/10 bg-white/5">
            <button
              onClick={() => {
                onAgree?.();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="CheckIcon" size={18} />
              <span>أوافق على الشروط</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
