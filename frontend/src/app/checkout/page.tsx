'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartReview from './components/CartReview';
import PaymentDeposit from './components/PaymentDeposit';
import OrderSummary from './components/OrderSummary';
import Icon from '@/components/ui/AppIcon';
import CustomDropdown from '@/components/ui/CustomDropdown';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useRouter } from 'next/navigation';
import { useStore, Product as StoreProduct, StorageDataMapping } from '@/store/useStore';
import { getDataItemEffectivePrices, calculateCartTotals, parseCapacityGB } from '@/lib/storageUtils';
import { getApiUrl } from '@/lib/apiConfig';
import PerStorageTracker, { StorageDevice, DataItem, StorageAssignment } from './components/PerStorageTracker';
import TermsOfServiceModal from '@/components/TermsOfServiceModal';
import PickupInfo from '@/components/checkout/PickupInfo';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  type: 'laptops' | 'accessories' | 'storage' | 'data' | 'games';
  size?: string;
  selectedBrand?: string;
}

interface GovernorateItem { _id: string; name: string; cost: number; }
interface ShippingMethod { _id: string; name: string; depositType: 'shipping_only' | 'total_amount'; governorates: GovernorateItem[]; }

const STEPS = [
  { id: 1, label: 'السلة والتوصيل' },
  { id: 2, label: 'البيانات والدفع' },
];

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`backdrop-blur-sm bg-white/[0.03] border border-white/10 rounded-2xl ${className}`}>{children}</div>;
}

function SectionTitle({ icon, label, sub }: { icon: string; label: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-h3 font-heading text-text-primary flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
          <Icon name={icon as any} size={16} className="text-brand-500" />
        </div>
        {label}
      </h2>
      {sub && <p className="text-caption text-text-muted mt-1 mr-10">{sub}</p>}
    </div>
  );
}

const slide = { initial: { opacity: 0, x: 28 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -28 }, transition: { duration: 0.22, ease: 'easeOut' as const } };
const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.2, ease: 'easeOut' as const } };

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems: storedCart,
    driveItems: storedDrive,
    products,
    addToCart,
    removeFromCart,
    removeFromDrive,
    clearCart,
    clearDrive,
    fetchProducts,
  } = useStore();

  const [activeStep, setActiveStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [driveItems, setDriveItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [selectedGovName, setSelectedGovName] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [requiredDeposit, setRequiredDeposit] = useState(0);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [storageAssignments, setStorageAssignments] = useState<StorageAssignment[]>([]);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const hasStorageProduct = storedCart.some((p) => p.type === 'storage');
  const storageTotal = useMemo(
    () => [...storedCart, ...storedDrive].filter((p) => p.type === 'storage')
      .reduce((acc, p) => acc + parseCapacityGB(p.storageCapacity, p.name) * ((p as any).quantity || 1), 0),
    [storedCart, storedDrive]
  );
  const cartTotals = useMemo(() => calculateCartTotals(storedCart), [storedCart]);
  const dataDiscount = cartTotals.freeDataGB * 0.5;
  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);

  const activeShippingMethod = shippingMethods.find((m) => m._id === selectedMethodId);
  const activeGov = activeShippingMethod?.governorates.find((g) => g.name === selectedGovName);

  const depositAmount = useMemo(() => {
    if (deliveryMethod === 'pickup') return 0;
    if (requiredDeposit > 0) return Math.round(requiredDeposit);
    if (!activeShippingMethod || !activeGov) return Math.max(50, shippingCost || 50);
    return activeShippingMethod.depositType === 'total_amount' ? subtotal + shippingCost : Math.max(50, shippingCost);
  }, [deliveryMethod, requiredDeposit, activeShippingMethod, activeGov, subtotal, shippingCost]);

  const effectiveShipping = deliveryMethod === 'pickup' ? 0 : shippingCost;

  const step2Valid = !!customerName?.trim() && !!phone?.trim() && !!customerEmail?.trim() &&
    (deliveryMethod === 'pickup' || (!!customerAddress?.trim() && !!selectedGovName));
  
  // Enhanced validation for Bosta shipping
  const isBostaSelected = selectedShippingMethod?.toLowerCase().includes('bosta') || 
                          selectedShippingMethod?.includes('بوسطة');
  
  const canConfirm = step2Valid && cartItems.length > 0 && termsAgreed &&
    (deliveryMethod === 'pickup' || receiptFile !== null);

  useEffect(() => {
    fetch(getApiUrl('shipping/methods'))
      .then((r) => r.json())
      .then((d) => {
        const list: ShippingMethod[] = d.methods || [];
        setShippingMethods(list);
        if (list.length === 1) setSelectedMethodId(list[0]._id);
      })
      .catch(() => {})
      .finally(() => setShippingLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const dataEffectivePrices = useMemo(() => getDataItemEffectivePrices(storedCart), [storedCart]);

  const toCartItems = (items: StoreProduct[]): CartItem[] =>
    items.map((p) => {
      const isData = p.type === 'data';
      const effectivePrice = isData ? (dataEffectivePrices.get(p.id) ?? p.price) : p.price;
      return {
        id: p.id, name: p.name, image: p.images?.[0] || '', price: effectivePrice,
        quantity: (p as any).quantity || 1, type: p.type,
        size: isData ? (typeof p.gbSize === 'number' && p.gbSize > 0 ? `${p.gbSize} GB` : undefined)
          : (typeof p.storageCapacity === 'number' ? `${p.storageCapacity} GB` : undefined),
        selectedBrand: (p as any).selectedBrand,
      };
    });

  useEffect(() => {
    setCartItems(toCartItems(storedCart));
    setDriveItems(toCartItems(storedDrive));
  }, [storedCart, storedDrive]);

  const storageDevices: StorageDevice[] = useMemo(() =>
    storedCart.filter((p) => p.type === 'storage').map((p, idx) => ({
      id: `${p.id}-${idx}-${p.storageCapacity || 0}`, name: p.name, subtype: p.subtype || 'Storage',
      capacityGB: parseCapacityGB(p.storageCapacity, p.name), quantity: (p as any).quantity || 1,
    })), [storedCart]);

  const dataItems: DataItem[] = useMemo(() =>
    storedCart.filter((p) => p.type === 'data').map((p) => ({
      id: p.id, name: p.name, sizeGB: p.gbSize || 0, quantity: (p as any).quantity || 1, image: p.images?.[0],
    })), [storedCart]);

  const handleUpdateQty = (id: string, qty: number) => {
    if (qty <= 0) { setCartItems((prev) => prev.filter((i) => i.id !== id)); removeFromCart(id); return; }
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };
  const handleRemoveCart = (id: string) => { setCartItems((prev) => prev.filter((i) => i.id !== id)); removeFromCart(id); };
  const handleRemoveDrive = (id: string) => { setDriveItems((prev) => prev.filter((i) => i.id !== id)); removeFromDrive(id); };

  const handleMethodChange = (methodId: string) => {
    setSelectedMethodId(methodId); setSelectedGovName(''); setShippingCost(0); setRequiredDeposit(0);
    const m = shippingMethods.find((m) => m._id === methodId);
    if (m) setSelectedShippingMethod(m.name);
  };
  const handleGovChange = (govName: string) => {
    setSelectedGovName(govName);
    const gov = activeShippingMethod?.governorates.find((g) => g.name === govName);
    const cost = gov?.cost || 0;
    setShippingCost(cost);
    if (activeShippingMethod) {
      setSelectedShippingMethod(activeShippingMethod.name);
      setRequiredDeposit(activeShippingMethod.depositType === 'total_amount' ? subtotal + cost : Math.max(50, cost));
    }
  };
  const handleAssignmentChange = (storageId: string, dataId: string, assigned: boolean) => {
    if (assigned) setStorageAssignments((prev) => [...prev, { storageId, dataId }]);
    else setStorageAssignments((prev) => prev.filter((a) => !(a.storageId === storageId && a.dataId === dataId)));
  };
  const generateStorageDataMapping = (): StorageDataMapping[] =>
    storageDevices.map((device) => ({
      storageItemId: device.id, storageName: device.name, storageCapacity: device.capacityGB * device.quantity,
      assignedData: storageAssignments.filter((a) => a.storageId === device.id)
        .map((a) => { const d = dataItems.find((x) => x.id === a.dataId); return d ? { dataItemId: d.id, dataName: d.name, sizeGB: d.sizeGB * d.quantity } : null; })
        .filter(Boolean) as { dataItemId: string; dataName: string; sizeGB: number }[],
    })).filter((m) => m.assignedData.length > 0);

  const handleConfirm = async () => {
    // Final validation before submission
    if (!customerName?.trim()) {
      alert('يرجى إدخال الاسم بالكامل');
      return;
    }
    if (!phone?.trim()) {
      alert('يرجى إدخال رقم الموبايل');
      return;
    }
    if (!customerEmail?.trim()) {
      alert('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if (deliveryMethod === 'delivery' && (!customerAddress?.trim() || !selectedGovName)) {
      alert('يرجى إكمال بيانات العنوان واختيار المحافظة');
      return;
    }
    if (!termsAgreed) {
      alert('يرجى الموافقة على شروط الخدمة');
      return;
    }
    if (deliveryMethod === 'delivery' && !receiptFile) {
      alert('يرجى رفع إيصال دفع العربون');
      return;
    }

    setIsLoading(true);
    const orderID = `AC-${Math.floor(Math.random() * 90000) + 10000}`;
    const storageDataMapping = generateStorageDataMapping();
    
    // Log Bosta selection for debugging
    if (isBostaSelected) {
      console.log('[Checkout] Bosta shipping selected - will trigger automatic shipment creation');
    }
    
    try {
      const res = await fetch(getApiUrl('orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID, customerName: customerName.trim(), phone: phone.trim(),
          address: deliveryMethod === 'pickup' ? null : customerAddress.trim(),
          customerEmail: customerEmail.trim(),
          selectedShippingMethod: deliveryMethod === 'pickup' ? 'store_pickup' : selectedShippingMethod,
          shippingCost: effectiveShipping,
          requiredDeposit: depositAmount,
          deliveryMethod,
          items: cartItems, driveItems,
          totalPrice: subtotal + effectiveShipping,
          capacityGB: storageTotal,
          uploadedPhotoUrl: deliveryMethod === 'pickup' ? null : receiptFile,
          storageDataMapping,
        }),
      });
      if (!res.ok) throw new Error('فشل إرسال الطلب');
      const existing = JSON.parse(localStorage.getItem('abuKartona_userOrders') || '[]');
      existing.push({ 
        orderId: orderID, 
        items: cartItems, 
        driveItems, 
        totalPrice: subtotal + effectiveShipping, 
        totalGb: storageTotal, 
        date: new Date().toISOString(), 
        status: isBostaSelected ? 'Shipping' : 'Pending', 
        customerName: customerName.trim(), 
        phone: phone.trim(), 
        address: deliveryMethod === 'pickup' ? null : customerAddress.trim(),
        selectedShippingMethod: deliveryMethod === 'pickup' ? 'store_pickup' : selectedShippingMethod,
        storageDataMapping 
      });
      localStorage.setItem('abuKartona_userOrders', JSON.stringify(existing));
      clearCart(); clearDrive(); setStorageAssignments([]);
      
      // Show success message with Bosta info if applicable
      if (isBostaSelected) {
        router.push(`/checkout/success?orderId=${orderID}&total=${subtotal + effectiveShipping}&deposit=${depositAmount}&drive=${driveItems.length}&bosta=true`);
      } else {
        router.push(`/checkout/success?orderId=${orderID}&total=${subtotal + effectiveShipping}&deposit=${depositAmount}&drive=${driveItems.length}`);
      }
    } catch (error) {
      console.error('[Checkout] Order submission error:', error);
      alert('حدث خطأ أثناء تأكيد الطلب. برجاء المحاولة مرة أخرى.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 pt-20 pb-16">
        {/* ── Page header ── */}
        <div className="bg-surface-secondary/30 backdrop-blur-sm border-b border-white/5 mb-8">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <h1 className="text-h1 font-heading text-text-primary mb-5">إتمام الشراء</h1>
            <div className="flex items-center gap-3">
              {STEPS.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => step.id < activeStep && setActiveStep(step.id)}
                    disabled={step.id > activeStep}
                    className={`flex items-center gap-2 flex-shrink-0 ${step.id < activeStep ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
                      activeStep === step.id ? 'bg-brand-500 text-[#0a1628] shadow-[0_0_18px_theme(colors.brand.500/35)]'
                      : activeStep > step.id ? 'bg-brand-500/20 text-brand-500' : 'bg-white/5 text-text-muted'
                    }`}>
                      {activeStep > step.id ? <Icon name="CheckIcon" size={14} /> : step.id}
                    </div>
                    <span className={`text-sm font-semibold hidden sm:block transition-colors duration-300 ${
                      activeStep === step.id ? 'text-text-primary' : activeStep > step.id ? 'text-brand-500' : 'text-text-muted'
                    }`}>{step.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-px transition-all duration-500 ${activeStep > step.id ? 'bg-brand-500/40' : 'bg-white/8'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* ── Main column ── */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">

                {/* ══════════════ STAGE 1 ══════════════ */}
                {activeStep === 1 && (
                  <motion.div key="s1" {...slide} className="space-y-5">

                    {/* Cart review */}
                    <GlassCard className="p-6">
                      <SectionTitle icon="ShoppingCartIcon" label="مراجعة السلة" />
                      <CartReview
                        items={cartItems} driveItems={driveItems}
                        onUpdateQty={handleUpdateQty}
                        onRemove={(id) => { handleRemoveCart(id); handleRemoveDrive(id); }}
                        storageTotal={storageTotal} storageUsed={cartTotals.freeDataGB}
                      />

                      {hasStorageProduct && storageTotal > 0 && (
                        <div className="mt-6 space-y-5 pt-5 border-t border-white/5">
                          <div>
                            <h3 className="text-body-sm font-bold text-text-primary mb-1 flex items-center gap-2">
                              <Icon name="CircleStackIcon" size={17} className="text-brand-500" />
                              توزيع البيانات على أجهزة التخزين
                            </h3>
                            <p className="text-caption text-text-muted mb-4">اختر البيانات التي تريد تخزينها على كل جهاز.</p>
                            <PerStorageTracker storageDevices={storageDevices} dataItems={dataItems} assignments={storageAssignments} onAssignmentChange={handleAssignmentChange} />
                          </div>
                          <div>
                            <h3 className="text-body-sm font-bold text-text-primary mb-1">أضف داتا لهاردك</h3>
                            <p className="text-caption text-text-muted mb-3">أضف منتجات DATA، ثم وزّعها على الأجهزة أعلاه.</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {(products || []).filter((p) => p.type === 'data').map((p) => {
                                const inCart = storedCart.some((c) => c.id === p.id);
                                return (
                                  <button key={p.id} type="button" onClick={() => !inCart && addToCart(p)} disabled={inCart}
                                    className={`product-card p-3 text-right ${inCart ? 'opacity-60 cursor-default' : ''}`}>
                                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-2 bg-surface-tertiary">
                                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><Icon name="PhotoIcon" size={24} className="text-text-muted" /></div>}
                                    </div>
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <span className="text-caption text-text-muted line-clamp-1">{p.subtype}</span>
                                      <span className="badge-new text-[9px] flex-shrink-0">مجاني</span>
                                    </div>
                                    <p className="text-caption font-bold text-text-primary mb-2 line-clamp-2">{p.name}</p>
                                    <span className="badge-size">{typeof p.gbSize === 'number' && p.gbSize > 0 ? `${p.gbSize} GB` : '—'}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </GlassCard>

                    {/* Delivery method selection */}
                    <GlassCard className="p-6">
                      <SectionTitle icon="TruckIcon" label="طريقة الاستلام" sub="اختر الطريقة المناسبة لك" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Home Delivery */}
                        <button
                          onClick={() => setDeliveryMethod('delivery')}
                          className={`relative p-5 rounded-2xl border-2 text-right transition-all duration-300 group overflow-hidden ${
                            deliveryMethod === 'delivery'
                              ? 'border-brand-500 bg-gradient-to-br from-brand-500/15 to-transparent'
                              : 'border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          {deliveryMethod === 'delivery' && (
                            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shadow-[0_0_14px_theme(colors.brand.500/50)]">
                              <Icon name="CheckIcon" size={13} className="text-[#0a1628]" />
                            </div>
                          )}
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${deliveryMethod === 'delivery' ? 'bg-brand-500/20' : 'bg-white/5 group-hover:bg-white/8'}`}>
                            <Icon name="TruckIcon" size={26} className={deliveryMethod === 'delivery' ? 'text-brand-500' : 'text-text-muted'} />
                          </div>
                          <p className={`text-base font-black mb-1.5 transition-colors ${deliveryMethod === 'delivery' ? 'text-text-primary' : 'text-text-secondary'}`}>توصيل للمنزل</p>
                          <p className={`text-xs leading-relaxed transition-colors ${deliveryMethod === 'delivery' ? 'text-brand-500' : 'text-text-muted'}`}>
                            لأي محافظة في مصر · تكلفة الشحن تُحدد في الخطوة التالية
                          </p>
                        </button>

                        {/* Store Pickup */}
                        <button
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`relative p-5 rounded-2xl border-2 text-right transition-all duration-300 group overflow-hidden ${
                            deliveryMethod === 'pickup'
                              ? 'border-brand-500 bg-gradient-to-br from-brand-500/15 to-transparent'
                              : 'border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          {deliveryMethod === 'pickup' && (
                            <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shadow-[0_0_14px_theme(colors.brand.500/50)]">
                              <Icon name="CheckIcon" size={13} className="text-[#0a1628]" />
                            </div>
                          )}
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${deliveryMethod === 'pickup' ? 'bg-brand-500/20' : 'bg-white/5 group-hover:bg-white/8'}`}>
                            <Icon name="BuildingStorefrontIcon" size={26} className={deliveryMethod === 'pickup' ? 'text-brand-500' : 'text-text-muted'} />
                          </div>
                          <p className={`text-base font-black mb-1.5 transition-colors ${deliveryMethod === 'pickup' ? 'text-text-primary' : 'text-text-secondary'}`}>استلام من المحل</p>
                          <p className={`text-xs leading-relaxed transition-colors ${deliveryMethod === 'pickup' ? 'text-brand-500' : 'text-text-muted'}`}>
                            بدون رسوم شحن · بدون عربون · الجيزة — شارع الهرم
                          </p>
                        </button>
                      </div>
                    </GlassCard>

                    {(cartItems.length > 0 || driveItems.length > 0) && (
                      <button onClick={() => setActiveStep(2)} className="btn-primary w-full py-4 text-body font-semibold flex items-center justify-center gap-2">
                        <span>متابعة: {deliveryMethod === 'pickup' ? 'بيانات الاستلام' : 'بيانات التوصيل والدفع'}</span>
                        <Icon name="ArrowLeftIcon" size={18} />
                      </button>
                    )}
                  </motion.div>
                )}

                {/* ══════════════ STAGE 2 ══════════════ */}
                {activeStep === 2 && (
                  <motion.div key="s2" {...slide} className="space-y-5">

                    {/* Delivery reminder badge */}
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                      deliveryMethod === 'pickup' ? 'bg-brand-500/5 border-brand-500/20' : 'bg-amber-500/5 border-amber-500/20'
                    }`}>
                      <Icon name={deliveryMethod === 'pickup' ? 'BuildingStorefrontIcon' : 'TruckIcon'} size={17}
                        className={deliveryMethod === 'pickup' ? 'text-brand-500' : 'text-amber-400'} />
                      <p className={`text-sm font-bold flex-1 ${deliveryMethod === 'pickup' ? 'text-brand-500' : 'text-amber-400'}`}>
                        {deliveryMethod === 'pickup' ? 'استلام من المحل — بدون عربون ولا شحن' : 'توصيل للمنزل — يلزم دفع عربون قبل الشحن'}
                      </p>
                      <button onClick={() => setActiveStep(1)} className="text-xs text-text-muted hover:text-text-secondary underline flex-shrink-0">تغيير</button>
                    </div>

                    {/* Customer details */}
                    <GlassCard className="p-6">
                      <SectionTitle icon="UserIcon" label="بيانات العميل" />
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-body-sm text-text-secondary mb-1.5">الاسم بالكامل <span className="text-red-400">*</span></label>
                            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-field w-full" placeholder="الاسم الثلاثي" />
                          </div>
                          <div>
                            <label className="block text-body-sm text-text-secondary mb-1.5">رقم الموبايل <span className="text-red-400">*</span></label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field w-full" placeholder="01xxxxxxxxx" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-body-sm text-text-secondary mb-1.5">البريد الإلكتروني <span className="text-red-400">*</span></label>
                          <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="input-field w-full" placeholder="example@email.com" dir="ltr" />
                        </div>

                        {/* Address — delivery only */}
                        <AnimatePresence>
                          {deliveryMethod === 'delivery' && (
                            <motion.div key="addr" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                              <label className="block text-body-sm text-text-secondary mb-1.5">العنوان بالتفصيل <span className="text-red-400">*</span></label>
                              <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)}
                                className="input-field min-h-[90px] resize-none w-full"
                                placeholder="المحافظة، المنطقة، اسم الشارع، رقم العمارة، رقم الشقة" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </GlassCard>

                    {/* Home delivery: shipping selector */}
                    <AnimatePresence>
                      {deliveryMethod === 'delivery' && (
                        <motion.div key="ship" {...fadeUp}>
                          <GlassCard className="p-6">
                            <SectionTitle icon="TruckIcon" label="تفاصيل الشحن" />
                            {shippingLoading ? (
                              <div className="flex items-center gap-2 text-sm text-text-muted py-3">
                                <div className="w-4 h-4 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                                جاري تحميل طرق الشحن...
                              </div>
                            ) : shippingMethods.length === 0 ? (
                              <p className="text-sm text-text-muted">لم يتم إضافة طرق شحن بعد.</p>
                            ) : (
                              <div className="space-y-4">
                                {shippingMethods.length > 1 && (
                                  <div>
                                    <p className="text-xs font-bold text-text-muted mb-2">١. اختر طريقة الشحن</p>
                                    <div className="space-y-2">
                                      {shippingMethods.map((m) => {
                                        const isBosta = m.name.toLowerCase().includes('bosta') || m.name.includes('بوسطة');
                                        return (
                                          <button key={m._id} onClick={() => handleMethodChange(m._id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-right ${
                                              selectedMethodId === m._id ? 'border-brand-500 bg-brand-500/10' : 'border-white/8 bg-white/[0.02] hover:border-white/20'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                              <span className={`text-sm font-bold ${selectedMethodId === m._id ? 'text-text-primary' : 'text-text-secondary'}`}>{m.name}</span>
                                              {isBosta && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                                                  Bosta
                                                </span>
                                              )}
                                            </div>
                                            <span className={`text-xs ${selectedMethodId === m._id ? 'text-brand-500' : 'text-text-muted'}`}>
                                              {m.depositType === 'total_amount' ? 'عربون: الإجمالي' : 'عربون: الشحن'}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                {activeShippingMethod && (
                                  <div>
                                    <p className="text-xs font-bold text-text-muted mb-2">{shippingMethods.length > 1 ? '٢.' : '١.'} اختر المحافظة</p>
                                    {activeShippingMethod.governorates.length === 0
                                      ? <p className="text-xs text-text-muted">لا توجد محافظات لهذه الطريقة.</p>
                                      : <CustomDropdown
                                          options={activeShippingMethod.governorates.map((g) => ({ value: g.name, label: `${g.name} — ${g.cost} جنيه` }))}
                                          value={selectedGovName} onChange={handleGovChange}
                                          placeholder="اختر المحافظة" className="w-full" />
                                    }
                                  </div>
                                )}
                                {activeGov && (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
                                      <span className="text-sm text-text-muted">تكلفة الشحن لـ {selectedGovName}</span>
                                      <span className="text-sm font-black text-brand-500">{shippingCost} جنيه</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                      <span className="text-sm text-text-muted">العربون المطلوب</span>
                                      <span className="text-sm font-black text-amber-400">{depositAmount} جنيه</span>
                                    </div>
                                    {isBostaSelected && (
                                      <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                        <Icon name="TruckIcon" size={16} className="text-blue-400 flex-shrink-0" />
                                        <p className="text-xs text-blue-400 font-bold">
                                          سيتم إنشاء شحنة بوسطة تلقائياً بعد تأكيد الطلب
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </GlassCard>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Store pickup info */}
                    <AnimatePresence>
                      {deliveryMethod === 'pickup' && (
                        <motion.div key="pickup-info" {...fadeUp}>
                          <PickupInfo />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Payment deposit — delivery only */}
                    <AnimatePresence>
                      {deliveryMethod === 'delivery' && (
                        <motion.div key="payment" {...fadeUp}>
                          <GlassCard className="p-6">
                            <SectionTitle icon="CreditCardIcon" label="دفع العربون" />
                            <PaymentDeposit depositAmount={depositAmount} onReceiptUpload={setReceiptFile as any} receiptFile={receiptFile} />
                          </GlassCard>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Terms */}
                    <GlassCard className="p-5">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="w-5 h-5 rounded border-white/20 bg-surface-tertiary text-brand-500 focus:ring-brand-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm text-text-primary">
                            أوافق على{' '}
                            <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-brand-500 font-bold hover:underline">شروط الخدمة</button>
                          </span>
                          <p className="text-xs text-text-muted mt-1">يجب الموافقة على الشروط لإتمام الطلب</p>
                        </div>
                      </label>
                    </GlassCard>

                    {/* Validation hint */}
                    {!canConfirm && (
                      <p className="text-xs text-text-muted text-center py-1">
                        {!customerName || !phone || !customerEmail ? '⚠️ أكمل بيانات العميل'
                          : deliveryMethod === 'delivery' && !customerAddress ? '⚠️ أدخل العنوان'
                          : deliveryMethod === 'delivery' && !selectedGovName ? '⚠️ اختر المحافظة'
                          : deliveryMethod === 'delivery' && !receiptFile ? '⚠️ ارفع إيصال الدفع'
                          : !termsAgreed ? '⚠️ وافق على شروط الخدمة' : ''}
                      </p>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3">
                      <button onClick={() => setActiveStep(1)} className="btn-ghost px-5 py-4 text-body-sm font-semibold flex items-center justify-center gap-2">
                        <Icon name="ArrowRightIcon" size={16} /> السابق
                      </button>
                      <button onClick={handleConfirm} disabled={!canConfirm || isLoading}
                        className="btn-primary flex-1 py-4 text-body font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                        {isLoading ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>جاري الإرسال...</span></>
                        ) : (
                          <><Icon name="CheckIcon" size={18} /><span>{deliveryMethod === 'pickup' ? 'تأكيد الطلب' : 'تأكيد وإرسال الطلب'}</span></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── Order summary sidebar ── */}
            <div className="lg:col-span-1">
              <OrderSummary
                items={cartItems} driveItems={driveItems}
                shippingCost={effectiveShipping}
                depositAmount={depositAmount}
                dataDiscount={dataDiscount}
                onConfirm={handleConfirm}
                canConfirm={canConfirm && activeStep === 2}
                isLoading={isLoading}
                termsAgreed={termsAgreed}
                isPickup={deliveryMethod === 'pickup'}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <TermsOfServiceModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} onAgree={() => setTermsAgreed(true)} showAgreeButton={true} />
    </div>
  );
}
