'use client';
import Icon from '@/components/ui/AppIcon';
import { usePaymentConfig } from '@/hooks/usePaymentConfig';
export default function PickupInfo({ className = '' }: { className?: string }) {
  const { data, isPending } = usePaymentConfig();
  const store = data?.store;
  return (
    <section
      className={`rounded-2xl border border-border bg-surface-secondary p-5 space-y-4 ${className}`}
    >
      <h3 className="font-semibold flex items-center gap-2">
        <Icon name="BuildingStorefrontIcon" size={20} className="text-brand-500" />
        معلومات الاستلام من المحل
      </h3>
      {isPending ? (
        <p role="status" className="text-sm text-text-muted">
          جاري تحميل معلومات المتجر…
        </p>
      ) : store ? (
        <>
          <div>
            <p className="font-semibold">{store.name}</p>
            <p className="text-sm text-brand-500 leading-7 mt-1 flex items-center gap-2">
              <Icon name="MapPinIcon" size={18} />
              القاهرة - حدائق حلوان
            </p>
          </div>
          {store.hours && <p className="text-sm text-text-secondary">ساعات العمل: {store.hours}</p>}
          <div className="flex flex-wrap items-center gap-3">
            {store.phone && (
              <a href={`tel:${store.phone}`} dir="ltr" className="btn-secondary text-sm">
                {store.phone}
              </a>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-text-muted">
          <span className="flex items-center gap-2 text-brand-500">
            <Icon name="MapPinIcon" size={18} />
            القاهرة - حدائق حلوان
          </span>
        </p>
      )}
      <p className="text-sm text-brand-500 leading-7">
        بدون رسوم شحن. عربون الحجز 100 جنيه يخصم من إجمالي الطلب، والمبلغ المتبقي عند الاستلام. يرجى
        انتظار تأكيد المتجر قبل الحضور.
      </p>
    </section>
  );
}
