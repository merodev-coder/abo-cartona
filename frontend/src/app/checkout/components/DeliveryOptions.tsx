'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import PickupInfo from '@/components/checkout/PickupInfo';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { getApiUrl } from '@/lib/apiConfig';

interface GovernorateItem {
  _id: string;
  name: string;
  cost: number;
}

interface ShippingMethodData {
  _id: string;
  name: string;
  depositType: 'shipping_only' | 'total_amount';
  governorates: GovernorateItem[];
}

interface DeliveryOptionsProps {
  onDeliveryChange: (
    method: string,
    governorate: string,
    cost: number,
    cityCode?: string,
    shippingMethodName?: string,
    depositType?: string,
    requiredDeposit?: number
  ) => void;
  orderSubtotal?: number;
}

export default function DeliveryOptions({
  onDeliveryChange,
  orderSubtotal = 0,
}: DeliveryOptionsProps) {
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [methods, setMethods] = useState<ShippingMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [selectedGovName, setSelectedGovName] = useState('');

  useEffect(() => {
    fetch(getApiUrl('shipping/methods'))
      .then((r) => r.json())
      .then((d) => {
        const list: ShippingMethodData[] = d.methods || [];
        setMethods(list);
        if (list.length === 1) setSelectedMethodId(list[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedMethod = methods.find((m) => m._id === selectedMethodId);
  const selectedGov = selectedMethod?.governorates.find((g) => g.name === selectedGovName);
  const shippingCost = deliveryType === 'pickup' ? 0 : selectedGov?.cost || 0;

  const calcDeposit = () => (deliveryType === 'pickup' ? 100 : shippingCost);

  const notify = (
    type: 'delivery' | 'pickup',
    govName: string,
    cost: number,
    method?: ShippingMethodData
  ) => {
    const deposit = type === 'pickup' ? 100 : cost;
    onDeliveryChange(type, govName, cost, undefined, method?.name, method?.depositType, deposit);
  };

  const handleDeliveryTypeChange = (t: 'delivery' | 'pickup') => {
    setDeliveryType(t);
    notify(t, selectedGovName, t === 'pickup' ? 0 : shippingCost, selectedMethod);
  };

  const handleMethodChange = (methodId: string) => {
    setSelectedMethodId(methodId);
    setSelectedGovName('');
    const method = methods.find((m) => m._id === methodId);
    notify('delivery', '', 0, method);
  };

  const handleGovChange = (govName: string) => {
    setSelectedGovName(govName);
    const gov = selectedMethod?.governorates.find((g) => g.name === govName);
    notify('delivery', govName, gov?.cost || 0, selectedMethod);
  };

  const deposit = calcDeposit();

  return (
    <div className="space-y-4">
      {/* Delivery Type Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleDeliveryTypeChange('delivery')}
          className={`p-4 rounded-2xl border transition-all text-right ${deliveryType === 'delivery' ? 'border-brand-500 bg-brand-500/10' : 'border-border bg-surface-secondary hover:border-border-light'}`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${deliveryType === 'delivery' ? 'bg-brand-500/20' : 'bg-surface-tertiary'}`}
          >
            <Icon
              name="TruckIcon"
              size={20}
              className={deliveryType === 'delivery' ? 'text-brand-500' : 'text-text-muted'}
            />
          </div>
          <p
            className={`text-sm font-black ${deliveryType === 'delivery' ? 'text-text-primary' : 'text-text-muted'}`}
          >
            توصيل للبيت
          </p>
          <p
            className={`text-xs mt-1 ${deliveryType === 'delivery' ? 'text-brand-500' : 'text-text-secondary'}`}
          >
            {selectedGov && deliveryType === 'delivery' ? `${shippingCost} جنيه` : 'حسب المحافظة'}
          </p>
        </button>

        <button
          onClick={() => handleDeliveryTypeChange('pickup')}
          className={`p-4 rounded-2xl border transition-all text-right ${deliveryType === 'pickup' ? 'border-brand-500 bg-brand-500/10' : 'border-border bg-surface-secondary hover:border-border-light'}`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${deliveryType === 'pickup' ? 'bg-brand-500/20' : 'bg-surface-tertiary'}`}
          >
            <Icon
              name="BuildingStorefrontIcon"
              size={20}
              className={deliveryType === 'pickup' ? 'text-brand-500' : 'text-text-muted'}
            />
          </div>
          <p
            className={`text-sm font-black ${deliveryType === 'pickup' ? 'text-text-primary' : 'text-text-muted'}`}
          >
            استلام من المحل
          </p>
          <p
            className={`text-xs mt-1 font-bold ${deliveryType === 'pickup' ? 'text-brand-500' : 'text-text-secondary'}`}
          >
            مجاناً
          </p>
        </button>
      </div>

      {/* Home Delivery Details */}
      {deliveryType === 'delivery' && (
        <div className="space-y-4 p-4 rounded-2xl bg-surface-secondary border border-border">
          <h4 className="text-sm font-black text-text-primary">تفاصيل التوصيل</h4>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-text-muted py-2">
              <div className="w-4 h-4 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
              جاري التحميل...
            </div>
          ) : methods.length === 0 ? (
            <p className="text-sm text-text-muted py-2">لم يتم إضافة طرق شحن بعد من لوحة التحكم</p>
          ) : (
            <>
              {/* Step 1 — Shipping Method */}
              <div>
                <p className="text-xs font-bold text-text-muted mb-2">١. اختار طريقة الشحن</p>
                <div className="space-y-2">
                  {methods.map((m) => (
                    <button
                      key={m._id}
                      onClick={() => handleMethodChange(m._id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-right ${
                        selectedMethodId === m._id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-border bg-surface-tertiary hover:border-border-light'
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${selectedMethodId === m._id ? 'text-text-primary' : 'text-text-secondary'}`}
                      >
                        {m.name}
                      </span>
                      <span
                        className={`text-xs ${selectedMethodId === m._id ? 'text-brand-500' : 'text-text-muted'}`}
                      >
                        دفعة مقدمة بقيمة الشحن
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 — Governorate */}
              {selectedMethod && (
                <div>
                  <p className="text-xs font-bold text-text-muted mb-2">٢. اختار المحافظة</p>
                  {selectedMethod.governorates.length === 0 ? (
                    <p className="text-xs text-text-muted">لا توجد محافظات لهذه الطريقة بعد</p>
                  ) : (
                    <CustomDropdown
                      options={selectedMethod.governorates.map((g) => ({
                        value: g.name,
                        label: `${g.name} — ${g.cost} جنيه`,
                      }))}
                      value={selectedGovName}
                      onChange={handleGovChange}
                      placeholder="اختار المحافظة"
                      className="w-full"
                    />
                  )}
                </div>
              )}

              {/* Summary */}
              {selectedGov && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
                    <span className="text-sm text-text-muted">
                      تكلفة الشحن لـ {selectedGovName}
                    </span>
                    <span className="text-sm font-black text-brand-500">{shippingCost} جنيه</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <span className="text-sm text-text-muted">العربون المطلوب</span>
                    <span className="text-sm font-black text-amber-500">{deposit} جنيه</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Store Pickup Details */}
      {deliveryType === 'pickup' && <PickupInfo />}
    </div>
  );
}
