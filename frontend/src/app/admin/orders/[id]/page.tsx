'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BostaShipButton from './components/BostaShipButton';
import Footer from '@/components/Footer';
import { getApiUrl } from '@/lib/apiConfig';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  type?: string;
}

interface AssignedData {
  dataItemId: string;
  dataName: string;
  sizeGB: number;
}

interface StorageMapping {
  storageItemId: string;
  storageName: string;
  storageCapacity: number;
  assignedData: AssignedData[];
}

interface Order {
  id: string;
  orderID: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  items: OrderItem[];
  driveItems: OrderItem[];
  totalPrice: number;
  capacityGB: number;
  uploadedPhotoUrl: string | null;
  status: string;
  deliveryMethod: string;
  selectedShippingMethod: string | null;
  shippingProvider: string | null;
  trackingNumber: string | null;
  deliveryId: string | null;
  storageDataMapping: StorageMapping[];
  createdAt: string;
  customerDetails?: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  pickupLocation?: {
    storeName: string;
    address: string;
    coordinates: { lat: number; lng: number };
    workingHours: string;
    phone: string;
  };
}

const STATUS_LABEL: Record<string, string> = {
  Pending: 'معلق',
  AwaitingPickup: 'في انتظار الاستلام',
  Shipping: 'جاري شحن الطلب',
  Completed: 'تم الاستلام',
  Cancelled: 'ملغي',
};

const STATUS_STYLE: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  AwaitingPickup: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Shipping: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      router.replace('/admin/login');
      return;
    }

    params.then(({ id }) => {
      setOrderId(id);
      fetch(getApiUrl(`orders/${id}`))
        .then((r) => {
          if (r.status === 404) { setNotFound(true); return null; }
          if (!r.ok) throw new Error('fetch failed');
          return r.json();
        })
        .then((data) => {
          if (data?.order) setOrder(data.order);
          else if (data !== null) setNotFound(true);
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    });
  }, [params, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-text-muted">جاري تحميل الطلب...</p>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <h1 className="text-xl font-black text-text-primary mb-2">الطلب غير موجود</h1>
        <Link href="/admin" className="text-brand-500 font-bold">
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  const proofImage = order.uploadedPhotoUrl;

  return (
    <div className="min-h-screen bg-surface flex flex-col" dir="rtl">
      <header className="bg-surface-secondary/50 border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Icon name="ArrowRightIcon" size={20} className="text-text-primary" />
            </Link>
            <h1 className="text-xl font-black text-text-primary font-heading">تفاصيل الطلب</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-text-primary font-heading mb-1">
                    الطلب {order.orderID || `#${order.id.slice(-6)}`}
                  </h2>
                  <p className="text-body-sm text-text-muted">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString('ar-EG', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </p>
                </div>
                <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${STATUS_STYLE[order.status] ?? STATUS_STYLE.Cancelled}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>

              {/* Customer Information Section */}
              <div className="mb-6">
                <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading flex items-center gap-2">
                  <Icon name="UserIcon" size={18} className="text-brand-500" />
                  معلومات العميل
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-surface-secondary p-4 rounded-xl border border-border">
                    <p className="text-caption text-text-muted mb-1">الاسم بالكامل</p>
                    <p className="text-body-sm font-bold text-text-primary">
                      {order.customerDetails?.name || order.customerName || '—'}
                    </p>
                  </div>
                  <div className="bg-surface-secondary p-4 rounded-xl border border-border">
                    <p className="text-caption text-text-muted mb-1">رقم الموبايل</p>
                    <p className="text-body-sm font-bold text-text-primary" dir="ltr">
                      {order.customerDetails?.phone || order.phone || '—'}
                    </p>
                  </div>
                  <div className="bg-surface-secondary p-4 rounded-xl border border-border">
                    <p className="text-caption text-text-muted mb-1">البريد الإلكتروني</p>
                    <p className="text-body-sm font-bold text-text-primary" dir="ltr">
                      {order.customerDetails?.email || order.email || '—'}
                    </p>
                  </div>
                  <div className="bg-surface-secondary p-4 rounded-xl border border-border lg:col-span-1">
                    <p className="text-caption text-text-muted mb-1">طريقة التوصيل</p>
                    <p className="text-body-sm font-bold text-text-primary">
                      {order.deliveryMethod === 'pickup' ? 'استلام من المحل' : 'توصيل للمنزل'}
                    </p>
                  </div>
                </div>
                
                {/* Shipping Address - Only show for delivery orders */}
                {order.deliveryMethod === 'delivery' && (
                  <div className="mt-4">
                    <div className="bg-surface-secondary p-4 rounded-xl border border-border">
                      <p className="text-caption text-text-muted mb-2">عنوان الشحن</p>
                      <p className="text-body-sm text-text-primary leading-relaxed">
                        {order.customerDetails?.address || order.address || '—'}
                      </p>
                    </div>
                    
                    {/* Shipping Method Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {order.selectedShippingMethod && (
                        <div className="bg-surface-secondary p-4 rounded-xl border border-border">
                          <p className="text-caption text-text-muted mb-1">طريقة الشحن</p>
                          <p className="text-body-sm font-bold text-text-primary">
                            {order.selectedShippingMethod}
                          </p>
                        </div>
                      )}
                      {order.shippingProvider && (
                        <div className="bg-surface-secondary p-4 rounded-xl border border-border">
                          <p className="text-caption text-text-muted mb-1">مزود الشحن</p>
                          <p className="text-body-sm font-bold text-text-primary">
                            {order.shippingProvider}
                            {order.trackingNumber && (
                              <span className="text-xs text-brand-500 mr-2">
                                ({order.trackingNumber})
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading">
                المنتجات المطلوبة
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-surface-secondary p-3 rounded-xl border border-border"
                  >
                    <div className="w-12 h-12 bg-surface-tertiary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="CubeIcon" size={20} className="text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-body-sm font-bold text-text-primary line-clamp-1">{item.name}</h4>
                      <p className="text-caption text-text-muted mt-0.5">الكمية: {item.quantity || 1}</p>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <p className="text-body-sm font-bold text-brand-500">
                        {(item.price || 0).toLocaleString('ar-EG')} جنيه
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Store Pickup Information */}
                {order.deliveryMethod === 'pickup' && order.pickupLocation && (
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading flex items-center gap-2">
                      <Icon name="BuildingStorefrontIcon" size={20} className="text-brand-500" />
                      معلومات الاستلام من المحل
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-500/5 border border-brand-500/15">
                        <Icon name="MapPinIcon" size={18} className="text-brand-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-black text-text-primary mb-1">{order.pickupLocation.storeName}</p>
                          <p className="text-xs text-text-muted leading-relaxed">{order.pickupLocation.address}</p>
                          <a
                            href={`https://maps.google.com/?q=${order.pickupLocation.coordinates.lat},${order.pickupLocation.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-brand-500 font-bold hover:underline"
                          >
                            <Icon name="MapIcon" size={12} />
                            افتح في جوجل ماب
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                          <Icon name="ClockIcon" size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-text-primary mb-1">ساعات العمل</p>
                            <p className="text-xs text-text-muted">{order.pickupLocation.workingHours}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                          <Icon name="PhoneIcon" size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-text-primary mb-1">رقم المحل</p>
                            <p className="text-xs text-text-muted" dir="ltr">{order.pickupLocation.phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                        <Icon name="CheckCircleIcon" size={15} className="text-green-400 flex-shrink-0" />
                        <p className="text-xs text-green-400 font-bold">
                          بدون رسوم شحن • بدون عربون • الدفع عند الاستلام
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Storage-Data Mapping */}
            {order.storageDataMapping && order.storageDataMapping.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading flex items-center gap-2">
                  <Icon name="ServerStackIcon" size={20} className="text-brand-500" />
                  توزيع البيانات على أجهزة التخزين
                </h3>
                <div className="space-y-4">
                  {order.storageDataMapping.map((mapping, idx) => (
                    <div key={idx} className="bg-surface-secondary rounded-xl border border-border overflow-hidden">
                      <div className="p-4 border-b border-border bg-brand-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                              <Icon name="CircleStackIcon" size={18} className="text-brand-500" />
                            </div>
                            <div>
                              <h4 className="text-body-sm font-bold text-text-primary">{mapping.storageName}</h4>
                              <p className="text-caption text-text-muted">
                                السعة: {mapping.storageCapacity?.toLocaleString('ar-EG')} GB
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-brand-500">
                            {mapping.assignedData?.length || 0} ملف
                          </span>
                        </div>
                      </div>

                      {mapping.assignedData && mapping.assignedData.length > 0 ? (
                        <div className="p-3 space-y-2">
                          {mapping.assignedData.map((data, dataIdx) => (
                            <div key={dataIdx} className="flex items-center gap-3 p-2 rounded-lg bg-surface-tertiary/50">
                              <Icon name="FolderIcon" size={16} className="text-amber-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text-primary line-clamp-1">{data.dataName}</p>
                              </div>
                              <span className="text-[10px] text-text-muted flex-shrink-0">
                                {data.sizeGB?.toLocaleString('ar-EG')} GB
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-2">
                            <span className="text-xs text-text-muted">إجمالي البيانات على هذا الجهاز:</span>
                            <span className="text-xs font-bold text-brand-500">
                              {mapping.assignedData.reduce((acc, d) => acc + (d.sizeGB || 0), 0).toLocaleString('ar-EG')} GB
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-caption text-text-muted">لا توجد بيانات مخصصة لهذا الجهاز</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-bold text-text-primary">إجمالي أجهزة التخزين:</span>
                    <span className="text-body-sm font-bold text-brand-500">
                      {order.storageDataMapping.length} جهاز
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-body-sm font-bold text-text-primary">إجمالي البيانات المخزنة:</span>
                    <span className="text-body-sm font-bold text-brand-500">
                      {order.storageDataMapping
                        .reduce((acc, m) => acc + (m.assignedData?.reduce((a, d) => a + (d.sizeGB || 0), 0) || 0), 0)
                        .toLocaleString('ar-EG')}{' '}
                      GB
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:w-80 w-full space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading">إجمالي الحساب</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">إجمالي المنتجات</span>
                  <span className="text-text-primary font-bold">
                    {order.totalPrice?.toLocaleString('ar-EG')} جنيه
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-body-lg font-bold text-text-primary">الإجمالي</span>
                  <span className="text-h3 font-bold text-brand-500 font-heading">
                    {order.totalPrice?.toLocaleString('ar-EG')} جنيه
                  </span>
                </div>
              </div>
            </div>

            <BostaShipButton
              orderId={order.orderID || order.id}
              status={order.status}
              deliveryMethod={order.deliveryMethod}
              selectedShippingMethod={order.selectedShippingMethod}
              shippingProvider={order.shippingProvider}
              trackingNumber={order.trackingNumber ?? undefined}
            />

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading flex items-center gap-2">
                <Icon name="PhotoIcon" size={20} className="text-text-muted" />
                إيصال الدفع
              </h3>
              {proofImage ? (
                <a
                  href={proofImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-white/5 group border border-white/10 hover:border-brand-500/50 transition-colors"
                >
                  <AppImage
                    src={proofImage}
                    alt="إيصال الدفع"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-body-sm bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-lg flex items-center gap-2">
                      <Icon name="ArrowsPointingOutIcon" size={16} /> عرض الصورة
                    </span>
                  </div>
                </a>
              ) : (
                <div className="w-full aspect-video rounded-xl bg-surface-tertiary border border-border flex flex-col items-center justify-center text-text-muted">
                  <Icon name="NoSymbolIcon" size={24} className="mb-2 opacity-50" />
                  <p className="text-xs">لا يوجد إيصال مرفق</p>
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-body-lg font-bold text-text-primary mb-4 font-heading flex items-center gap-2">
                <Icon name="ShieldCheckIcon" size={20} className="text-amber-400" />
                شروط الخدمة
              </h3>
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-sm text-text-primary leading-relaxed mb-3">
                  ⚠️ العميل وافق على شروط الخدمة عند إتمام الطلب
                </p>
                <div className="space-y-2 text-xs text-text-muted">
                  <p>• التعويض الكامل خلال 14 يوم في حالة ضرر المنتج أثناء الشحن</p>
                  <p>• تصوير فيديو للمنتج قبل فتح الكارتونة (الضامن الوحيد)</p>
                  <p>• مدة الإرجاع: 3 أيام بنفس الحالة</p>
                  <p>• استرداد الأموال عبر المحافظ الإلكترونية أو التحويلات البنكية</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
