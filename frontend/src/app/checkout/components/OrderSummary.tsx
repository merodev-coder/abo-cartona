'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: string;
  size?: string;
  images?: string[];
  image?: string;
  selectedBrand?: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  driveItems: CartItem[];
  shippingCost: number;
  depositAmount: number;
  dataDiscount?: number;
  onConfirm: () => void;
  canConfirm: boolean;
  isLoading: boolean;
  termsAgreed?: boolean;
  isPickup?: boolean;
}

export default function OrderSummary({
  items,
  driveItems,
  shippingCost,
  depositAmount,
  dataDiscount = 0,
  onConfirm,
  canConfirm,
  isLoading,
  termsAgreed = true,
  isPickup = false,
}: OrderSummaryProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;
  const remaining = total - depositAmount;

  return (
    <div className="glass-card rounded-3xl p-6 sticky top-24">
      <h3 className="text-base font-black text-text-primary mb-5 flex items-center gap-2">
        <Icon name="ReceiptPercentIcon" size={18} className="text-brand-500" />
        ملخص الأوردر
      </h3>

      {/* Line Items */}
      <div className="space-y-3 mb-5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {item.images?.[0] || item.image ? (
                <div className="w-8 h-8 rounded-lg bg-surface-tertiary overflow-hidden relative flex-shrink-0">
                  <AppImage
                    src={item.images?.[0] || item.image || '/placeholder.png'}
                    alt={item.name}
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                  <Icon name="PhotoIcon" size={12} className="text-text-secondary" />
                </div>
              )}
              <span className="text-xs text-text-muted line-clamp-1">
                {item.name}
                {item.selectedBrand && ` (${item.selectedBrand})`} × {item.quantity}
              </span>
            </div>
            <span className="text-xs font-bold text-text-primary flex-shrink-0">
              {item.price * item.quantity === 0
              ? <span className="text-brand-500 font-bold">مجاناً</span>
              : <>{(item.price * item.quantity).toLocaleString('ar-EG')} جنيه</>}
            </span>
          </div>
        ))}

        {driveItems.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">داتا مجانية ({driveItems.length} ملف)</span>
            <span className="text-xs font-bold text-brand-500">مجاناً 🎁</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border my-4" />

      {/* Totals */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">إجمالي المنتجات</span>
          <span className="text-sm font-bold text-text-primary">
            {subtotal.toLocaleString('ar-EG')} جنيه
          </span>
        </div>
        {dataDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-400 flex items-center gap-1">
              <Icon name="GiftIcon" size={14} />
              داتا مجانية مع الهارد
            </span>
            <span className="text-sm font-bold text-green-400">-{dataDiscount.toLocaleString('ar-EG')} جنيه</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">تكلفة الشحن</span>
          <span
            className={`text-sm font-bold ${shippingCost === 0 ? 'text-brand-500' : 'text-text-primary'}`}
          >
            {shippingCost === 0 ? 'مجاناً' : `${shippingCost} جنيه`}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="p-4 rounded-2xl bg-surface-secondary border border-white/5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-black text-text-primary">الإجمالي</span>
          <span className="text-xl font-black text-text-primary">
            {total.toLocaleString('ar-EG')} جنيه
          </span>
        </div>
        {!isPickup && (
          <div className="border-t border-border pt-2 mt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-bold">عربون الشحن (الآن)</span>
              <span className="text-xs font-black text-amber-400">{depositAmount} جنيه</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">المتبقي عند الاستلام</span>
              <span className="text-xs font-bold text-text-muted">
                {remaining.toLocaleString('ar-EG')} جنيه
              </span>
            </div>
          </div>
        )}
        {isPickup && (
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-500 font-bold">استلام من المحل — بدون عربون</span>
              <span className="text-xs font-black text-brand-500">مجاناً</span>
            </div>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-surface-tertiary">
        {[
          { icon: 'LockClosedIcon', text: 'دفع آمن' },
          { icon: 'ShieldCheckIcon', text: 'ضمان أصالة' },
          { icon: 'ArrowPathIcon', text: 'إرجاع مضمون' },
        ].map((b) => (
          <div key={b.text} className="flex-1 text-center">
            <Icon name={b.icon} size={16} className="text-brand-500 mx-auto mb-1" />
            <p className="text-[9px] text-text-muted leading-tight">{b.text}</p>
          </div>
        ))}
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        disabled={!canConfirm || isLoading || !termsAgreed}
        className={`btn-primary w-full py-4 text-base font-black flex items-center justify-center gap-2 relative z-10 ${
          !canConfirm || isLoading || !termsAgreed ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-bg-deep border-t-transparent animate-spin" />
            <span className="relative z-10">جاري التأكيد...</span>
          </>
        ) : (
          <>
            <span className="relative z-10">تأكيد الأوردر ودفع العربون</span>
            <Icon name="CheckCircleIcon" size={18} className="text-bg-deep relative z-10" />
          </>
        )}
      </button>

      {!canConfirm && (
        <p className="text-xs text-amber-400 text-center mt-2 font-bold">
          ارفع صورة الإيصال لتأكيد الأوردر
        </p>
      )}

      {!termsAgreed && (
        <p className="text-xs text-red-400 text-center mt-2 font-bold">
          يجب الموافقة على شروط الخدمة
        </p>
      )}
    </div>
  );
}
