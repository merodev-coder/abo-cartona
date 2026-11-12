'use client';
import Currency from '@/components/ui/Currency';
import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/apiConfig';
import { checkoutToken } from '@/lib/checkoutSession';
import { depositLabels } from '@/lib/depositLabels';
import DepositPaymentUpload from '@/app/checkout/components/PaymentDeposit';
import Icon from '@/components/ui/AppIcon';
interface Status {
  orderID: string;
  status: string;
  depositStatus: string;
  depositRejectionReason?: string;
  orderTotalMinor: number;
  depositAmountMinor: number;
  remainingBalanceMinor: number;
  fulfillmentMethod?: 'pickup' | 'delivery';
  depositType?: string;
  pickupAddress?: string;
}
export default function DepositStatus({ orderID }: { orderID: string }) {
  const [order, setOrder] = useState<Status | null>(null);
  const [proof, setProof] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function refresh() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(getApiUrl(`orders/${orderID}/customer-status`), {
        headers: { 'X-Checkout-Token': checkoutToken() },
        cache: 'no-store',
      });
      if (!res.ok)
        throw new Error('تعذر تحميل الحالة. افتح الطلب من نفس المتصفح الذي استخدمته للشراء.');
      setOrder(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحميل الحالة');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, [orderID]);
  async function resubmit() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(getApiUrl(`orders/${orderID}/resubmit-proof`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Checkout-Token': checkoutToken() },
        body: JSON.stringify({ proofId: proof }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProof(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر إرسال الإثبات');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="text-start rounded-2xl border border-brand-500/20 p-5 my-5 space-y-3"
      aria-busy={busy}
    >
      <h2 className="font-semibold">حالة دفع العربون</h2>
      {order && (
        <>
          <p role="status" className="text-brand-500">
            {order.status === 'AwaitingPickup'
              ? 'الطلب جاهز للاستلام'
              : depositLabels[order.depositStatus] || order.depositStatus}
          </p>
          {order.fulfillmentMethod === 'pickup' && (
            <p className="flex items-center gap-2 text-sm text-brand-500">
              <Icon name="MapPinIcon" size={18} />
              القاهرة - حدائق حلوان
            </p>
          )}
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt>الإجمالي</dt>
              <dd>
                <Currency value={order.orderTotalMinor / 100} />
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>العربون</dt>
              <dd>
                <Currency value={order.depositAmountMinor / 100} />
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>المتبقي بعد تأكيد التحويل</dt>
              <dd>
                <Currency value={order.remainingBalanceMinor / 100} />
              </dd>
            </div>
          </dl>
          {order.depositStatus === 'REJECTED' && order.status !== 'Cancelled' && (
            <>
              <p className="text-sm text-red-300">سبب الرفض: {order.depositRejectionReason}</p>
              <DepositPaymentUpload
                orderID={order.orderID}
                isPickup={order.fulfillmentMethod === 'pickup'}
                depositAmount={order.depositAmountMinor / 100}
                onReceiptUpload={setProof}
                receiptFile={proof}
              />
              <button
                type="button"
                className="btn-primary w-full"
                disabled={!proof || busy}
                onClick={resubmit}
              >
                إعادة إرسال إثبات الدفع
              </button>
            </>
          )}
        </>
      )}
      <p role="alert" className="text-sm text-red-300">
        {error}
      </p>
      <button type="button" className="btn-secondary" disabled={busy} onClick={refresh}>
        تحديث الحالة
      </button>
    </section>
  );
}
