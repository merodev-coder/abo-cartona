'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getApiUrl } from '@/lib/apiConfig';
import { checkoutToken, formatEGP } from '@/lib/checkoutSession';
import { usePaymentConfig } from '@/hooks/usePaymentConfig';

interface Props {
  depositAmount: number;
  orderTotal?: number;
  isPickup?: boolean;
  onReceiptUpload: (proofId: string | null) => void;
  receiptFile: string | null;
}
export default function PaymentDeposit({
  depositAmount,
  orderTotal,
  isPickup = false,
  onReceiptUpload,
  receiptFile,
}: Props) {
  const { data: config, isPending, isError } = usePaymentConfig();
  const methods = config?.methods || [];
  const loaded = !isPending;
  const maxBytes = config?.maxBytes || 5242880;
  const [method, setMethod] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const request = useRef<XMLHttpRequest | null>(null);
  const selectedMethod = method || methods[0]?.id || '';
  const active = methods.find((m) => m.id === selectedMethod);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  const upload = (file?: File) => {
    if (!file || progress !== null) return;
    setError('');
    onReceiptUpload(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > maxBytes) {
      setError('اختر صورة JPEG أو PNG أو WebP بحجم لا يتجاوز 5 ميجابايت.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setProgress(0);
    const xhr = new XMLHttpRequest();
    request.current = xhr;
    xhr.open('POST', getApiUrl('orders/proofs'));
    xhr.setRequestHeader('X-Checkout-Token', checkoutToken());
    xhr.timeout = 90000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    const failed = () => {
      setProgress(null);
      setError('تعذر رفع الصورة. أعد اختيارها للمحاولة مرة أخرى.');
    };
    xhr.onerror = failed;
    xhr.ontimeout = failed;
    xhr.onabort = () => setProgress(null);
    xhr.onload = () => {
      setProgress(null);
      try {
        const result: { proofId?: string; error?: string } = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && result.proofId)
          onReceiptUpload(result.proofId);
        else setError(result.error || 'تعذر رفع الصورة.');
      } catch {
        failed();
      }
    };
    const body = new FormData();
    body.append('paymentMethod', selectedMethod);
    body.append('proof', file);
    xhr.send(body);
  };
  return (
    <section className="space-y-5" aria-label="إثبات دفع العربون" aria-busy={progress !== null}>
      <div className="rounded-2xl border border-brand-500/25 bg-brand-500/5 p-5 space-y-2">
        <h3 className="font-semibold text-lg">
          {isPickup ? 'تأكيد الاستلام من المحل' : 'تأكيد دفع العربون'}
        </h3>
        <p className="text-sm text-text-secondary leading-7">
          لإتمام طلبك يرجى دفع عربون بقيمة {formatEGP(depositAmount)}. سيتم خصم العربون من إجمالي
          الطلب وتدفع المبلغ المتبقي عند الاستلام{isPickup ? ' من المحل' : ''}.
        </p>
        <p className="text-sm text-text-muted">
          الصورة إثبات مساعد؛ يتم تأكيد التحويل بعد مراجعة المتجر.
        </p>
        {isPickup && (
          <p className="text-sm text-text-muted">الحد الأدنى لطلب الاستلام من المحل 100 جنيه.</p>
        )}
      </div>
      <dl className="grid gap-3 sm:grid-cols-3 rounded-2xl bg-surface-secondary p-4 text-sm">
        {orderTotal !== undefined && (
          <div>
            <dt className="text-text-muted">إجمالي الطلب</dt>
            <dd className="mt-2 font-semibold">{formatEGP(orderTotal)}</dd>
          </div>
        )}
        <div>
          <dt className="text-text-muted">قيمة العربون</dt>
          <dd className="mt-2 font-semibold text-brand-500">{formatEGP(depositAmount)}</dd>
        </div>
        {orderTotal !== undefined && (
          <div>
            <dt className="text-text-muted">المتبقي بعد تأكيد التحويل</dt>
            <dd className="mt-2 font-semibold">
              {formatEGP(Math.max(0, orderTotal - depositAmount))}
            </dd>
          </div>
        )}
      </dl>
      {!loaded ? (
        <p role="status">جاري تحميل طرق الدفع…</p>
      ) : !methods.length ? (
        <p role="status" className="text-amber-300">
          الدفع غير متاح حالياً. يرجى التواصل مع المتجر قبل التحويل.
        </p>
      ) : (
        <>
          <fieldset disabled={progress !== null || receiptFile !== null} className="space-y-3">
            <legend className="text-sm font-semibold mb-3">طريقة الدفع</legend>
            <div className="grid grid-cols-2 gap-3">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className="selection-card flex gap-2 items-center p-4 rounded-xl border border-border has-[:checked]:border-brand-500 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={m.id}
                    checked={selectedMethod === m.id}
                    onChange={() => setMethod(m.id)}
                  />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {active && (
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm mb-2">حوّل قيمة العربون إلى حساب {active.name}:</p>
              <p dir="ltr" className="font-semibold break-all text-start select-all">
                {active.destination}
              </p>
            </div>
          )}
          <label className="block rounded-2xl border border-dashed border-brand-500/40 p-5 bg-surface-secondary space-y-3">
            <span className="block text-sm font-semibold">صورة إيصال التحويل</span>
            <input
              aria-describedby="proof-help proof-error"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={progress !== null}
              onChange={(e) => {
                upload(e.target.files?.[0]);
                e.target.value = '';
              }}
              className="block w-full min-w-0 text-sm file:me-3 file:rounded-lg file:border-0 file:bg-brand-500 file:p-3 file:text-slate-950"
            />
            <span id="proof-help" className="block text-xs text-text-muted">
              JPEG، PNG أو WebP — حتى 5 ميجابايت. يمكنك اختيار صورة من الكاميرا أو المعرض.
            </span>
          </label>
        </>
      )}
      <AnimatePresence initial={false}>
        {preview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="معاينة إيصال التحويل"
              className="w-full h-48 object-contain rounded-xl bg-surface-secondary"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                request.current?.abort();
                setPreview(null);
                onReceiptUpload(null);
                setError('');
              }}
            >
              إزالة الصورة
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div role="status" aria-live="polite" className="text-sm">
        {progress !== null ? (
          <>
            <progress max={100} value={progress} className="w-full" />
            {progress === 100 ? 'جاري فحص الصورة وحفظها…' : `جاري الرفع ${progress}%`}
          </>
        ) : receiptFile ? (
          <span className="text-brand-500">
            تم حفظ الصورة بأمان. ستتم مراجعة التحويل بعد إرسال الطلب.
          </span>
        ) : null}
      </div>
      <p id="proof-error" role="alert" className="text-sm text-red-300">
        {error || (isError ? 'تعذر تحميل طرق الدفع. يرجى المحاولة لاحقاً.' : '')}
      </p>
    </section>
  );
}
