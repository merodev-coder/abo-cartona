'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface PaymentDepositProps {
  depositAmount: number;
  onReceiptUpload: (file: File | string | null) => void;
  receiptFile: File | string | null;
}

import { UploadDropzone } from '@/utils/uploadthing';

type PaymentMethod = 'vodafone' | 'instapay';

export default function PaymentDeposit({
  depositAmount,
  onReceiptUpload,
  receiptFile,
}: PaymentDepositProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('vodafone');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof receiptFile === 'string'
      ? receiptFile
      : receiptFile instanceof File
        ? URL.createObjectURL(receiptFile)
        : null
  );

  useEffect(() => {
    if (!receiptFile) {
      setPreviewUrl(null);
    }
  }, [receiptFile]);

  const paymentMethods = [
    {
      id: 'vodafone' as PaymentMethod,
      name: 'Vodafone Cash',
      icon: '📱',
      number: '201067957449',
      color: '#E60000',
      instructions: 'حول المبلغ على رقم Vodafone Cash وارفع صورة الإيصال',
    },
    {
      id: 'instapay' as PaymentMethod,
      name: 'InstaPay',
      icon: '💳',
      number: 'abocartona@instapay',
      color: '#00A0E9',
      instructions: 'حول المبلغ على حساب InstaPay وارفع صورة الإيصال',
    },
  ];

  const activeMethod = paymentMethods.find((m) => m.id === selectedMethod)!;

  return (
    <div className="space-y-5">
      {/* Deposit Info */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <Icon
            name="InformationCircleIcon"
            size={18}
            className="text-amber-400 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-black text-amber-400 mb-1">عربون الشحن الإلزامي</p>
            <p className="text-xs text-text-muted leading-relaxed">
              لتأكيد الأوردر، لازم تدفع عربون الشحن أونلاين. المبلغ ده بيتخصم من إجمالي الأوردر عند
              الاستلام.
            </p>
          </div>
        </div>
      </div>

      {/* Deposit Amount */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-secondary border border-white/8">
        <div>
          <p className="text-xs text-text-muted mb-1">مبلغ العربون المطلوب</p>
          <p className="text-3xl font-black text-text-primary">
            {depositAmount} <span className="text-lg text-text-muted">جنيه</span>
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
          <Icon name="BanknotesIcon" size={26} className="text-brand-500" />
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <p className="text-sm font-black text-text-primary text-text-primary mb-3">
          اختار طريقة الدفع
        </p>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-2xl border transition-all text-right ${
                selectedMethod === method.id
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-white/8 bg-surface-secondary hover:border-white/20'
              }`}
            >
              <span className="text-2xl block mb-2">{method.icon}</span>
              <p
                className={`text-sm font-black ${selectedMethod === method.id ? 'text-text-primary' : 'text-text-muted'}`}
              >
                {method.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="p-4 rounded-2xl bg-surface-secondary border border-white/5 space-y-3">
        <p className="text-xs font-black text-brand-500 uppercase tracking-wider">خطوات الدفع</p>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] font-black text-brand-500">1</span>
            </div>
            <p className="text-sm text-text-primary">{activeMethod.instructions}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] font-black text-brand-500">2</span>
            </div>
            <div>
              <p className="text-sm text-text-primary mb-1">الرقم / الحساب:</p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-surface border border-white/8">
                <span className="text-sm font-black text-text-primary flex-1" dir="ltr">
                  {activeMethod.number}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(activeMethod.number)}
                  className="text-brand-500 hover:text-primary-bright transition-colors"
                >
                  <Icon name="ClipboardDocumentIcon" size={14} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] font-black text-brand-500">3</span>
            </div>
            <p className="text-sm text-text-primary">ارفع صورة الإيصال هنا تحت</p>
          </div>
        </div>
      </div>

      {/* Receipt Upload */}
      <div>
        <p className="text-sm font-black text-text-primary mb-3">ارفع صورة الإيصال</p>

        {previewUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-brand-500/30">
            <div className="relative h-48">
              <AppImage
                src={previewUrl}
                alt="صورة الإيصال"
                fill
                className="object-contain bg-surface-secondary bg-surface-secondary"
                sizes="400px"
              />
            </div>
            <div className="p-3 bg-surface-secondary bg-surface-secondary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={16} className="text-brand-500" />
                <span className="text-xs font-bold text-brand-500">تم رفع الإيصال</span>
              </div>
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  onReceiptUpload(null);
                }}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                <Icon name="TrashIcon" size={12} />
                <span>حذف</span>
              </button>
            </div>
          </div>
        ) : (
          <UploadDropzone
            endpoint="orderAttachment"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                const url = res[0].url;
                setPreviewUrl(url);
                onReceiptUpload(url);
              }
            }}
            onUploadError={(error: Error) => {
              alert(`خطأ في الرفع: ${error.message}`);
            }}
            appearance={{
              container:
                'border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02] p-8 cursor-pointer hover:border-brand-500/30 transition-colors',
              label: 'text-sm font-bold text-text-primary text-text-primary',
              allowedContent: 'text-xs text-text-muted',
              button: 'bg-brand-500 text-bg-deep font-bold text-sm px-4 py-2 rounded-lg',
            }}
            content={{
              uploadIcon: (
                <Icon name="CloudArrowUpIcon" size={32} className="text-brand-500 mb-2" />
              ),
              label: 'اسحب صورة الإيصال هنا أو اضغط للرفع',
            }}
          />
        )}
      </div>
    </div>
  );
}
