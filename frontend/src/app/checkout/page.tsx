'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartReview from './components/CartReview';
import DepositPaymentUpload from './components/PaymentDeposit';
import OrderSummary from './components/OrderSummary';
import Icon from '@/components/ui/AppIcon';
import CustomDropdown from '@/components/ui/CustomDropdown';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useRouter } from 'next/navigation';
import { useStore, Product as StoreProduct, StorageDataMapping } from '@/store/useStore';
import {
  getDataItemEffectivePrices,
  calculateCartTotals,
  parseCapacityGB,
} from '@/lib/storageUtils';
import { getApiUrl } from '@/lib/apiConfig';
import { checkoutKey, checkoutToken } from '@/lib/checkoutSession';
import FulfillmentChoice from '@/components/checkout/FulfillmentChoice';
import PerStorageTracker, {
  StorageDevice,
  DataItem,
  StorageAssignment,
} from './components/PerStorageTracker';
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

interface GovernorateItem {
  _id: string;
  name: string;
  cost: number;
}
interface ShippingMethod {
  _id: string;
  name: string;
  depositType: 'shipping_only' | 'total_amount';
  governorates: GovernorateItem[];
}

const STEPS = [
  { id: 1, label: 'السلة والتوصيل' },
  { id: 2, label: 'البيانات والدفع' },
];

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`backdrop-blur-sm bg-white/[0.03] border border-white/10 rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
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

const slide = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
  transition: { duration: 0.22, ease: 'easeOut' as const },
};
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems: storedCart,
    driveItems: storedDrive,
    products,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    removeFromDrive,
    clearCart,
    clearDrive,
    fetchProducts,
  } = useStore();

  const [activeStep, setActiveStep] = useState(1);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(activeStep);
  useEffect(() => {
    if (previousStep.current === activeStep) return;
    previousStep.current = activeStep;
    stepHeading.current?.focus({ preventScroll: true });
    stepHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [activeStep]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [driveItems, setDriveItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const submitting = useRef(false);
  const [submitError, setSubmitError] = useState('');

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
  const [receipt, setReceipt] = useState<{ id: string; context: string } | null>(null);
  const [storageAssignments, setStorageAssignments] = useState<StorageAssignment[]>([]);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const hasStorageProduct = storedCart.some((p) => p.type === 'storage');
  const storageTotal = useMemo(
    () =>
      [...storedCart, ...storedDrive]
        .filter((p) => p.type === 'storage')
        .reduce(
          (acc, p) => acc + parseCapacityGB(p.storageCapacity, p.name) * ((p as any).quantity || 1),
          0
        ),
    [storedCart, storedDrive]
  );
  const cartTotals = useMemo(() => calculateCartTotals(storedCart), [storedCart]);
  const dataDiscount = cartTotals.freeDataGB * 0.5;
  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  const activeShippingMethod = shippingMethods.find((m) => m._id === selectedMethodId);
  const activeGov = activeShippingMethod?.governorates.find((g) => g.name === selectedGovName);

  const depositAmount = deliveryMethod === 'pickup' ? 100 : shippingCost;
  const receiptContext = `${deliveryMethod}:${Math.round(depositAmount * 100)}`;
  useEffect(() => {
    setReceipt((previous) => (previous?.context === receiptContext ? previous : null));
  }, [receiptContext]);
  const receiptFile = receipt?.context === receiptContext ? receipt.id : null;
  const setReceiptFile = (id: string | null) =>
    setReceipt(id ? { id, context: receiptContext } : null);

  const effectiveShipping = deliveryMethod === 'pickup' ? 0 : shippingCost;

  const step2Valid =
    !!customerName?.trim() &&
    !!phone?.trim() &&
    !!customerEmail?.trim() &&
    (deliveryMethod === 'pickup' || (!!customerAddress?.trim() && !!selectedGovName));

  // Enhanced validation for Bosta shipping
  const isBostaSelected =
    selectedShippingMethod?.toLowerCase().includes('bosta') ||
    selectedShippingMethod?.includes('بوسطة');

  const canConfirm =
    step2Valid &&
    cartItems.length > 0 &&
    termsAgreed &&
    receiptFile !== null &&
    (deliveryMethod !== 'pickup' || subtotal >= 100);

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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const dataEffectivePrices = useMemo(() => getDataItemEffectivePrices(storedCart), [storedCart]);

  const toCartItems = (items: StoreProduct[]): CartItem[] =>
    items.map((p) => {
      const isData = p.type === 'data';
      const effectivePrice = isData ? (dataEffectivePrices.get(p.id) ?? p.price) : p.price;
      return {
        id: p.id,
        name: p.name,
        image: p.images?.[0] || '',
        price: effectivePrice,
        quantity: (p as any).quantity || 1,
        type: p.type,
        size: isData
          ? typeof p.gbSize === 'number' && p.gbSize > 0
            ? `${p.gbSize} GB`
            : undefined
          : typeof p.storageCapacity === 'number'
            ? `${p.storageCapacity} GB`
            : undefined,
        selectedBrand: (p as any).selectedBrand,
      };
    });

  useEffect(() => {
    setCartItems(toCartItems(storedCart));
    setDriveItems(toCartItems(storedDrive));
  }, [storedCart, storedDrive, dataEffectivePrices]);

  const storageDevices: StorageDevice[] = useMemo(
    () =>
      storedCart
        .filter((p) => p.type === 'storage')
        .map((p, idx) => ({
          id: `${p.id}-${idx}-${p.storageCapacity || 0}`,
          name: p.name,
          subtype: p.subtype || 'Storage',
          capacityGB: parseCapacityGB(p.storageCapacity, p.name),
          quantity: (p as any).quantity || 1,
        })),
    [storedCart]
  );

  const dataItems: DataItem[] = useMemo(
    () =>
      storedCart
        .filter((p) => p.type === 'data')
        .map((p) => ({
          id: p.id,
          name: p.name,
          sizeGB: p.gbSize || 0,
          quantity: (p as any).quantity || 1,
          image: p.images?.[0],
        })),
    [storedCart]
  );

  const handleUpdateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      removeFromCart(id);
      return;
    }
    updateCartQuantity(id, qty);
  };
  const handleRemoveCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    removeFromCart(id);
  };
  const handleRemoveDrive = (id: string) => {
    setDriveItems((prev) => prev.filter((i) => i.id !== id));
    removeFromDrive(id);
  };

  const handleMethodChange = (methodId: string) => {
    setSelectedMethodId(methodId);
    setSelectedGovName('');
    setShippingCost(0);
    setRequiredDeposit(0);
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
      setRequiredDeposit(
        activeShippingMethod.depositType === 'total_amount' ? subtotal + cost : Math.max(50, cost)
      );
    }
  };
  const handleAssignmentChange = (storageId: string, dataId: string, assigned: boolean) => {
    if (assigned) setStorageAssignments((prev) => [...prev, { storageId, dataId }]);
    else
      setStorageAssignments((prev) =>
        prev.filter((a) => !(a.storageId === storageId && a.dataId === dataId))
      );
  };
  const generateStorageDataMapping = (): StorageDataMapping[] =>
    storageDevices
      .map((device) => ({
        storageItemId: device.id,
        storageName: device.name,
        storageCapacity: device.capacityGB * device.quantity,
        assignedData: storageAssignments
          .filter((a) => a.storageId === device.id)
          .map((a) => {
            const d = dataItems.find((x) => x.id === a.dataId);
            return d ? { dataItemId: d.id, dataName: d.name, sizeGB: d.sizeGB * d.quantity } : null;
          })
          .filter(Boolean) as { dataItemId: string; dataName: string; sizeGB: number }[],
      }))
      .filter((m) => m.assignedData.length > 0);

  const handleConfirm = async () => {
    if (submitting.current || !canConfirm) return;
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
    if (!receiptFile) {
      alert('يرجى رفع إيصال دفع العربون');
      return;
    }

    submitting.current = true;
    setSubmitError('');
    setIsLoading(true);
    const storageDataMapping = generateStorageDataMapping();

    // Log Bosta selection for debugging
    if (isBostaSelected) {
      console.log('[Checkout] Bosta shipping selected - will trigger automatic shipment creation');
    }

    try {
      const payload = JSON.stringify({
        customerName: customerName.trim(),
        phone: phone.trim(),
        customerEmail: customerEmail.trim(),
        address: deliveryMethod === 'pickup' ? null : customerAddress.trim(),
        deliveryMethod,
        governorate: selectedGovName,
        selectedShippingMethod: activeShippingMethod?.name,
        items: cartItems,
        driveItems,
        proofId: receiptFile,
        depositAmountMinor: Math.round(depositAmount * 100),
        storageDataMapping,
      });
      const res = await fetch(getApiUrl('orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Checkout-Token': checkoutToken(),
          'Idempotency-Key': checkoutKey(payload),
        },
        body: payload,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل إرسال الطلب');
      const orderID: string = result.order.orderID;
      const existing = JSON.parse(localStorage.getItem('abuKartona_userOrders') || '[]');
      existing.push({
        orderId: orderID,
        items: cartItems,
        driveItems,
        totalPrice: result.order.totalPrice,
        totalGb: storageTotal,
        date: new Date().toISOString(),
        status: 'Pending',
        depositStatus: result.order.depositStatus,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: deliveryMethod === 'pickup' ? null : customerAddress.trim(),
        selectedShippingMethod:
          deliveryMethod === 'pickup' ? 'store_pickup' : selectedShippingMethod,
        storageDataMapping,
        deliveryMethod,
      });
      localStorage.setItem('abuKartona_userOrders', JSON.stringify(existing));
      clearCart();
      clearDrive();
      setStorageAssignments([]);

      sessionStorage.removeItem('checkout-attempt');
      router.push(
        `/checkout/success?orderId=${orderID}&total=${result.order.totalPrice}&deposit=${result.order.depositAmountMinor / 100}&drive=${driveItems.length}`
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'تعذر تأكيد الطلب. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  const BRAND = '#37D7AC';
  const BRAND_RGB = '55, 215, 172';

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: '#080C14' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            top: '15%',
            right: '10%',
            width: 'clamp(250px, 30vw, 400px)',
            height: 'clamp(250px, 30vw, 400px)',
            background: `radial-gradient(circle, rgba(${BRAND_RGB},0.04) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{ y: [0, -14, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.018,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Top gradient line */}
      <div
        className="fixed top-0 left-0 right-0 h-px z-50"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${BRAND_RGB},0.25) 50%, transparent)`,
        }}
      />

      <Header />

      <main className="flex-1 pt-20 pb-16">
        {/* ── Page header ── */}
        <div className="bg-surface-secondary/30 backdrop-blur-sm border-b border-white/5 mb-8">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <h1
              ref={stepHeading}
              tabIndex={-1}
              className="text-h1 font-heading text-text-primary mb-5"
            >
              إتمام الشراء
            </h1>
            <div className="flex items-center gap-3">
              {STEPS.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => step.id < activeStep && setActiveStep(step.id)}
                    disabled={step.id > activeStep}
                    className={`flex items-center gap-2 flex-shrink-0 ${step.id < activeStep ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
                        activeStep === step.id
                          ? 'bg-brand-500 text-[#0a1628] shadow-[0_0_18px_theme(colors.brand.500/35)]'
                          : activeStep > step.id
                            ? 'bg-brand-500/20 text-brand-500'
                            : 'bg-white/5 text-text-muted'
                      }`}
                    >
                      {activeStep > step.id ? <Icon name="CheckIcon" size={14} /> : step.id}
                    </div>
                    <span
                      className={`text-sm font-semibold hidden sm:block transition-colors duration-300 ${
                        activeStep === step.id
                          ? 'text-text-primary'
                          : activeStep > step.id
                            ? 'text-brand-500'
                            : 'text-text-muted'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px transition-all duration-500 ${activeStep > step.id ? 'bg-brand-500/40' : 'bg-white/8'}`}
                    />
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
                        items={cartItems}
                        driveItems={driveItems}
                        onUpdateQty={handleUpdateQty}
                        onRemove={(id) => {
                          handleRemoveCart(id);
                          handleRemoveDrive(id);
                        }}
                        storageTotal={storageTotal}
                        storageUsed={cartTotals.freeDataGB}
                      />

                      {hasStorageProduct && storageTotal > 0 && (
                        <div className="mt-6 space-y-5 pt-5 border-t border-white/5">
                          <div>
                            <h3 className="text-body-sm font-bold text-text-primary mb-1 flex items-center gap-2">
                              <Icon name="CircleStackIcon" size={17} className="text-brand-500" />
                              توزيع البيانات على أجهزة التخزين
                            </h3>
                            <p className="text-caption text-text-muted mb-4">
                              اختر البيانات التي تريد تخزينها على كل جهاز.
                            </p>
                            <PerStorageTracker
                              storageDevices={storageDevices}
                              dataItems={dataItems}
                              assignments={storageAssignments}
                              onAssignmentChange={handleAssignmentChange}
                            />
                          </div>
                          <div>
                            <h3 className="text-body-sm font-bold text-text-primary mb-1">
                              أضف داتا لهاردك
                            </h3>
                            <p className="text-caption text-text-muted mb-3">
                              أضف منتجات DATA، ثم وزّعها على الأجهزة أعلاه.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {(products || [])
                                .filter((p) => p.type === 'data')
                                .map((p) => {
                                  const inCart = storedCart.some((c) => c.id === p.id);
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => !inCart && addToCart(p)}
                                      disabled={inCart}
                                      className={`product-card p-3 text-right ${inCart ? 'opacity-60 cursor-default' : ''}`}
                                    >
                                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-2 bg-surface-tertiary">
                                        {p.images?.[0] ? (
                                          <img
                                            src={p.images[0]}
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Icon
                                              name="PhotoIcon"
                                              size={24}
                                              className="text-text-muted"
                                            />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="text-caption text-text-muted line-clamp-1">
                                          {p.subtype}
                                        </span>
                                        <span className="badge-new text-[9px] flex-shrink-0">
                                          مجاني
                                        </span>
                                      </div>
                                      <p className="text-caption font-bold text-text-primary mb-2 line-clamp-2">
                                        {p.name}
                                      </p>
                                      <span className="badge-size">
                                        {typeof p.gbSize === 'number' && p.gbSize > 0
                                          ? `${p.gbSize} GB`
                                          : '—'}
                                      </span>
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
                      <SectionTitle
                        icon="TruckIcon"
                        label="طريقة الاستلام"
                        sub="اختر الطريقة المناسبة لك"
                      />
                      <FulfillmentChoice value={deliveryMethod} onChange={setDeliveryMethod} />
                    </GlassCard>

                    {(cartItems.length > 0 || driveItems.length > 0) && (
                      <button
                        onClick={() => setActiveStep(2)}
                        className="btn-primary w-full py-4 text-body font-semibold flex items-center justify-center gap-2"
                      >
                        <span>
                          متابعة:{' '}
                          {deliveryMethod === 'pickup'
                            ? 'بيانات الاستلام'
                            : 'بيانات التوصيل والدفع'}
                        </span>
                        <Icon name="ArrowLeftIcon" size={18} />
                      </button>
                    )}
                  </motion.div>
                )}

                {/* ══════════════ STAGE 2 ══════════════ */}
                {activeStep === 2 && (
                  <motion.div key="s2" {...slide} className="space-y-5">
                    {/* Delivery reminder badge */}
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                        deliveryMethod === 'pickup'
                          ? 'bg-brand-500/5 border-brand-500/20'
                          : 'bg-amber-500/5 border-amber-500/20'
                      }`}
                    >
                      <Icon
                        name={deliveryMethod === 'pickup' ? 'BuildingStorefrontIcon' : 'TruckIcon'}
                        size={17}
                        className={
                          deliveryMethod === 'pickup' ? 'text-brand-500' : 'text-amber-400'
                        }
                      />
                      <p
                        className={`text-sm font-bold flex-1 ${deliveryMethod === 'pickup' ? 'text-brand-500' : 'text-amber-400'}`}
                      >
                        {deliveryMethod === 'pickup'
                          ? 'استلام من المحل — عربون 100 جنيه يخصم من الإجمالي'
                          : 'توصيل للمنزل — يلزم دفع عربون قبل الشحن'}
                      </p>
                      <button
                        onClick={() => setActiveStep(1)}
                        className="text-xs text-text-muted hover:text-text-secondary underline flex-shrink-0"
                      >
                        تغيير
                      </button>
                    </div>

                    {/* Customer details */}
                    <GlassCard className="p-6">
                      <SectionTitle icon="UserIcon" label="بيانات العميل" />
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="checkout-name"
                              className="block text-body-sm text-text-secondary mb-1.5"
                            >
                              الاسم بالكامل <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              id="checkout-name"
                              autoComplete="name"
                              required
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="input-field w-full"
                              placeholder="الاسم الثلاثي"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="checkout-phone"
                              className="block text-body-sm text-text-secondary mb-1.5"
                            >
                              رقم الموبايل <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="tel"
                              id="checkout-phone"
                              autoComplete="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="input-field w-full"
                              placeholder="01xxxxxxxxx"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="checkout-email"
                            className="block text-body-sm text-text-secondary mb-1.5"
                          >
                            البريد الإلكتروني <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="email"
                            id="checkout-email"
                            autoComplete="email"
                            required
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="input-field w-full"
                            placeholder="example@email.com"
                            dir="ltr"
                          />
                        </div>

                        {/* Address — delivery only */}
                        <AnimatePresence>
                          {deliveryMethod === 'delivery' && (
                            <motion.div
                              key="addr"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <label
                                htmlFor="checkout-address"
                                className="block text-body-sm text-text-secondary mb-1.5"
                              >
                                العنوان بالتفصيل <span className="text-red-400">*</span>
                              </label>
                              <textarea
                                id="checkout-address"
                                autoComplete="street-address"
                                required
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                className="input-field min-h-[90px] resize-none w-full"
                                placeholder="المحافظة، المنطقة، اسم الشارع، رقم العمارة، رقم الشقة"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </GlassCard>

                    {/* Home delivery: shipping selector */}
                    <AnimatePresence>
                      {deliveryMethod === 'delivery' && (
                        <motion.div key="ship" {...fadeUp} className="relative z-20">
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
                                    <p className="text-xs font-bold text-text-muted mb-2">
                                      ١. اختر طريقة الشحن
                                    </p>
                                    <div className="space-y-2">
                                      {shippingMethods.map((m) => {
                                        const isBosta =
                                          m.name.toLowerCase().includes('bosta') ||
                                          m.name.includes('بوسطة');
                                        return (
                                          <button
                                            key={m._id}
                                            onClick={() => handleMethodChange(m._id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-right ${
                                              selectedMethodId === m._id
                                                ? 'border-brand-500 bg-brand-500/10'
                                                : 'border-white/8 bg-white/[0.02] hover:border-white/20'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span
                                                className={`text-sm font-bold ${selectedMethodId === m._id ? 'text-text-primary' : 'text-text-secondary'}`}
                                              >
                                                {m.name}
                                              </span>
                                              {isBosta && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                                                  Bosta
                                                </span>
                                              )}
                                            </div>
                                            <span
                                              className={`text-xs ${selectedMethodId === m._id ? 'text-brand-500' : 'text-text-muted'}`}
                                            >
                                              دفعة مقدمة بقيمة الشحن
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                {activeShippingMethod && (
                                  <div>
                                    <p className="text-xs font-bold text-text-muted mb-2">
                                      {shippingMethods.length > 1 ? '٢.' : '١.'} اختر المحافظة
                                    </p>
                                    {activeShippingMethod.governorates.length === 0 ? (
                                      <p className="text-xs text-text-muted">
                                        لا توجد محافظات لهذه الطريقة.
                                      </p>
                                    ) : (
                                      <CustomDropdown
                                        options={activeShippingMethod.governorates.map((g) => ({
                                          value: g.name,
                                          label: `${g.name} — ${g.cost} جنيه`,
                                        }))}
                                        value={selectedGovName}
                                        onChange={handleGovChange}
                                        placeholder="اختر المحافظة"
                                        className="w-full"
                                      />
                                    )}
                                  </div>
                                )}
                                {activeGov && (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
                                      <span className="text-sm text-text-muted">
                                        تكلفة الشحن لـ {selectedGovName}
                                      </span>
                                      <span className="text-sm font-black text-brand-500">
                                        {shippingCost} جنيه
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                      <span className="text-sm text-text-muted">
                                        العربون المطلوب
                                      </span>
                                      <span className="text-sm font-black text-amber-400">
                                        {depositAmount} جنيه
                                      </span>
                                    </div>
                                    {isBostaSelected && (
                                      <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                        <Icon
                                          name="TruckIcon"
                                          size={16}
                                          className="text-blue-400 flex-shrink-0"
                                        />
                                        <p className="text-xs text-blue-400 font-bold">
                                          سيقوم المتجر بتأكيد تفاصيل الشحنة بعد مراجعة الطلب
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
                      {(deliveryMethod === 'delivery' || deliveryMethod === 'pickup') && (
                        <motion.div key="payment" {...fadeUp}>
                          <GlassCard className="p-6">
                            <SectionTitle icon="CreditCardIcon" label="دفع العربون" />
                            <DepositPaymentUpload
                              key={receiptContext}
                              checkout={{
                                deliveryMethod,
                                selectedShippingMethod: activeShippingMethod?.name,
                                governorate: selectedGovName,
                                items: cartItems,
                                driveItems,
                              }}
                              depositAmount={depositAmount}
                              orderTotal={subtotal + effectiveShipping}
                              isPickup={deliveryMethod === 'pickup'}
                              onReceiptUpload={setReceiptFile}
                              receiptFile={receiptFile}
                            />
                            {deliveryMethod === 'pickup' && subtotal < 100 && (
                              <p role="alert" className="mt-4 text-sm text-amber-300">
                                الحد الأدنى لطلب الاستلام من المحل 100 جنيه. يرجى إضافة منتجات إلى
                                السلة.
                              </p>
                            )}
                          </GlassCard>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {submitError && (
                      <p
                        role="alert"
                        className="rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-300"
                      >
                        {submitError}
                      </p>
                    )}
                    {/* Terms */}
                    <GlassCard className="p-5">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="w-5 h-5 rounded border-white/20 bg-surface-tertiary text-brand-500 focus:ring-brand-500 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-sm text-text-primary">
                            أوافق على{' '}
                            <button
                              type="button"
                              onClick={() => setIsTermsModalOpen(true)}
                              className="text-brand-500 font-bold hover:underline"
                            >
                              شروط الخدمة
                            </button>
                          </span>
                          <p className="text-xs text-text-muted mt-1">
                            يجب الموافقة على الشروط لإتمام الطلب
                          </p>
                        </div>
                      </label>
                    </GlassCard>

                    {/* Validation hint */}
                    {!canConfirm && (
                      <p className="text-xs text-text-muted text-center py-1">
                        {!customerName || !phone || !customerEmail
                          ? '⚠️ أكمل بيانات العميل'
                          : deliveryMethod === 'delivery' && !customerAddress
                            ? '⚠️ أدخل العنوان'
                            : deliveryMethod === 'delivery' && !selectedGovName
                              ? '⚠️ اختر المحافظة'
                              : !receiptFile
                                ? '⚠️ ارفع إيصال الدفع'
                                : !termsAgreed
                                  ? '⚠️ وافق على شروط الخدمة'
                                  : ''}
                      </p>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveStep(1)}
                        className="btn-ghost px-5 py-4 text-body-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <Icon name="ArrowRightIcon" size={16} /> السابق
                      </button>
                      <button
                        onClick={handleConfirm}
                        disabled={!canConfirm || isLoading}
                        className="btn-primary flex-1 py-4 text-body font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>جاري الإرسال...</span>
                          </>
                        ) : (
                          <>
                            <Icon name="CheckIcon" size={18} />
                            <span>
                              {deliveryMethod === 'pickup' ? 'تأكيد الطلب' : 'تأكيد وإرسال الطلب'}
                            </span>
                          </>
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
                items={cartItems}
                driveItems={driveItems}
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
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={() => setTermsAgreed(true)}
        showAgreeButton={true}
      />
    </div>
  );
}
