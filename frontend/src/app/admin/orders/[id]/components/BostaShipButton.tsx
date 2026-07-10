'use client';

import React, { useState } from 'react';
import { getAdminApiUrl } from '@/lib/apiConfig';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface OrderActionsProps {
  orderId: string;
  status: string;
  deliveryMethod?: string;
  selectedShippingMethod?: string | null;
  shippingProvider?: string | null;
  trackingNumber?: string;
}

async function patchStatus(orderId: string, status: string, extra?: Record<string, string>) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(getAdminApiUrl(`orders/${orderId}/status`), {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, ...extra }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || 'فشل تحديث حالة الطلب');
  }
  return res.json();
}

export default function BostaShipButton({ orderId, status, deliveryMethod = 'delivery', selectedShippingMethod, shippingProvider, trackingNumber }: OrderActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const isPickup = deliveryMethod === 'pickup';
  const isCompleted = status === 'Completed';
  const isShipping = status === 'Shipping';
  const isPending = status === 'Pending' || status === 'AwaitingPickup';
  
  // Check if this is a Bosta order
  const isBostaOrder = shippingProvider === 'Bosta' || 
    (selectedShippingMethod && selectedShippingMethod.toLowerCase().includes('bosta')) ||
    (selectedShippingMethod && selectedShippingMethod.includes('بوسطة'));

  const run = async (action: string, patchFn: () => Promise<void>) => {
    setLoading(action);
    try {
      await patchFn();
      router.refresh();
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleBostaShip = () =>
    run('bosta', async () => {
      // Validate that this is a Bosta-eligible order
      if (selectedShippingMethod && !isBostaOrder) {
        throw new Error('هذا الطلب لا يستخدم طريقة شحن بوسطة');
      }

      const res = await fetch(getAdminApiUrl('orders/ship'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          const errorDetails = Object.values(data.details).filter(Boolean).join(', ');
          throw new Error(`${data.error}: ${errorDetails}`);
        }
        throw new Error(data.error || 'فشل الشحن مع بوسطة');
      }
      
      // Update order status to Shipping
      await patchStatus(orderId, 'Shipping', { shippingProvider: 'Bosta' });
      
      if (data.trackingNumber) {
        alert(`تم إنشاء الشحنة بنجاح!\nرقم التتبع: ${data.trackingNumber}\nرابط التتبع: ${data.trackingUrl}`);
      } else {
        alert('تم إنشاء الشحنة بنجاح!');
      }
    });

  const handleOtherShip = () =>
    run('other', () => patchStatus(orderId, 'Shipping', { shippingProvider: 'other' }).then(() => {}));

  const handleConfirmReceipt = () =>
    run('confirm', () => patchStatus(orderId, 'Completed').then(() => {}));

  if (isCompleted) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Icon name="CheckBadgeIcon" size={22} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-black text-emerald-400">تم استلام الطلب</p>
            <p className="text-xs text-text-muted mt-0.5">اكتمل الطلب بنجاح</p>
          </div>
        </div>
      </div>
    );
  }

  if (isPickup) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading flex items-center gap-2">
          <Icon name="BuildingStorefrontIcon" size={20} className="text-brand-500" />
          تأكيد الاستلام
        </h3>
        {isPending && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-blue-500/8 border border-blue-500/20">
            <Icon name="ClockIcon" size={15} className="text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-400">في انتظار استلام العميل من المحل</p>
          </div>
        )}
        <button
          onClick={handleConfirmReceipt}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'confirm' ? (
            <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
          ) : (
            <Icon name="CheckCircleIcon" size={18} />
          )}
          {loading === 'confirm' ? 'جاري التأكيد...' : 'تأكيد الاستلام'}
        </button>
      </div>
    );
  }

  if (isShipping) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading flex items-center gap-2">
          <Icon name="TruckIcon" size={20} className="text-cyan-400" />
          خيارات الشحن
        </h3>
        {trackingNumber && isBostaOrder && (
          <a
            href={`https://track.bosta.co/${trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-blue-500/20 mb-3"
          >
            <Icon name="MapPinIcon" size={14} />
            تتبع الطلب — بوسطة ({trackingNumber})
            <Icon name="ArrowTopRightOnSquareIcon" size={13} />
          </a>
        )}
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-cyan-500/8 border border-cyan-500/20">
          <Icon name="TruckIcon" size={15} className="text-cyan-400 flex-shrink-0" />
          <p className="text-xs text-cyan-400">الطلب جاري شحنه — في انتظار تأكيد الاستلام</p>
        </div>
        <button
          onClick={handleConfirmReceipt}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'confirm' ? (
            <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
          ) : (
            <Icon name="CheckCircleIcon" size={18} />
          )}
          {loading === 'confirm' ? 'جاري التأكيد...' : 'تأكيد الاستلام'}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading flex items-center gap-2">
        <Icon name="TruckIcon" size={20} className="text-brand-500" />
        خيارات الشحن
      </h3>
      <div className="space-y-3">
        <button
          onClick={handleBostaShip}
          disabled={loading !== null}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all bg-blue-500/10 border border-blue-500/25 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/45 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            {loading === 'bosta' ? (
              <Icon name="ArrowPathIcon" size={17} className="animate-spin" />
            ) : (
              <Icon name="TruckIcon" size={17} />
            )}
            <span>{loading === 'bosta' ? 'جاري الشحن...' : 'شحن مع بوسطة'}</span>
          </div>
          <span className="text-[10px] text-blue-400/60 font-normal">Bosta</span>
        </button>

        <button
          onClick={handleOtherShip}
          disabled={loading !== null}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/45 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            {loading === 'other' ? (
              <Icon name="ArrowPathIcon" size={17} className="animate-spin" />
            ) : (
              <Icon name="BuildingLibraryIcon" size={17} />
            )}
            <span>{loading === 'other' ? 'جاري الشحن...' : 'شحن مع شركة أخرى'}</span>
          </div>
          <span className="text-[10px] text-indigo-400/60 font-normal">Other</span>
        </button>
      </div>
    </div>
  );
}
