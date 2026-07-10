'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import WhatsAppButton from '@/components/WhatsAppButton';

interface StoredOrder {
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    selectedBrand?: string;
  }>;
  driveItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  totalGb: number;
  date: string;
  status: 'Pending' | 'Shipped' | 'Completed' | 'Cancelled';
  customerName: string;
  phone: string;
  address: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem('abuKartona_userOrders') || '[]');
    setOrders(storedOrders);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface flex flex-col" dir="rtl">
        <Header />
        <main className="flex-1 pt-20 pb-12">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-surface-secondary rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
            </div>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="bg-surface-secondary/40 border-b border-border mb-8">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <p className="section-label mb-2">الأوردرات</p>
            <h1 className="text-2xl md:text-3xl font-black text-text-primary">طلباتك الحالية</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {orders.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
                <Icon name="CubeIcon" size={28} className="text-text-muted" />
              </div>
              <p className="text-lg font-black text-text-primary mb-1">لا يوجد طلبات بعد</p>
              <p className="text-sm text-text-muted">قم بعمل طلب من صفحة الشيك آوت وسيظهر هنا</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="glass-card rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-text-muted">رقم الطلب</p>
                      <p className="text-sm font-black text-text-primary" dir="ltr">
                        #{order.orderId}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(order.date).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`badge-new ${order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-600' : order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-600' : order.status === 'Completed' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-2xl bg-surface-secondary border border-white/5">
                      <p className="text-xs text-text-muted mb-1">المنتجات</p>
                      <p className="text-sm font-black text-text-primary line-clamp-2">
                        {order.items
                          .map((i) => `${i.name}${i.selectedBrand ? ` (${i.selectedBrand})` : ''}`)
                          .join(' • ') || '—'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-secondary border border-white/5">
                      <p className="text-xs text-text-muted mb-1">الإجمالي</p>
                      <p className="text-sm font-black text-brand-500">ج.{order.totalPrice}</p>
                    </div>
                  </div>

                  {order.driveItems.length > 0 && (
                    <div className="p-4 rounded-2xl bg-surface-secondary border border-white/5 mb-4">
                      <p className="text-xs text-text-muted mb-1">الداتا</p>
                      <p className="text-sm font-black text-brand-500">{order.totalGb} GB</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-text-muted">
                    <div>
                      <p className="mb-1">الاسم</p>
                      <p className="font-semibold text-text-primary">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="mb-1">رقم الهاتف</p>
                      <p className="font-semibold text-text-primary">{order.phone}</p>
                    </div>
                    <div>
                      <p className="mb-1">العنوان</p>
                      <p className="font-semibold text-text-primary line-clamp-1">
                        {order.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
