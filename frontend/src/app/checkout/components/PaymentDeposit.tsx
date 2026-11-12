'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getApiUrl } from '@/lib/apiConfig';
import { checkoutToken } from '@/lib/checkoutSession';
import Currency from '@/components/ui/Currency';
import { UploadCloud } from 'lucide-react';
import { usePaymentConfig } from '@/hooks/usePaymentConfig';

interface Props {
  depositAmount: number;
  orderTotal?: number;
  isPickup?: boolean;
  onReceiptUpload: (proofId: string | null) => void;
  receiptFile: string | null;
  checkout?: {
    deliveryMethod: 'pickup' | 'delivery';
    selectedShippingMethod?: string;
    governorate?: string;
    items: { id: string; quantity: number; selectedBrand?: string }[];
    driveItems?: { id: string; quantity: number }[];
  };
  orderID?: string;
}
export default function DepositPaymentUpload({
  depositAmount,
  orderTotal,
  isPickup = false,
  onReceiptUpload,
  receiptFile,
  checkout,
  orderID,
}: Props) {
  const { data: config, isPending, isError, refetch } = usePaymentConfig();
  const reducedMotion = useReducedMotion();
  const methods = config?.methods || [];
  const loaded = !isPending;
  const maxBytes = config?.maxBytes || 5242880;
  const [method, setMethod] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const request = useRef<XMLHttpRequest | null>(null);
  const selectedFile = useRef<File | null>(null);
  const selectedMethod = method || methods[0]?.id || '';
  const active = methods.find((m) => m.id === selectedMethod);
  const ready =
    !!active?.destination?.trim() &&
    config?.configuration?.uploadReady !== false &&
    !isError &&
    loaded;
  useEffect(() => () => request.current?.abort(), []);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  const upload = (file?: File) => {
    if (
      !file ||
      progress !== null ||
      (request.current && ![0, 4].includes(request.current.readyState))
    )
      return;
    setError('');
    onReceiptUpload(null);
    if (!orderID && !checkout) {
      setError('تعذر تجهيز بيانات الدفع. يرجى تحديث الصفحة.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > maxBytes) {
      setError('اختر صورة JPEG أو PNG أو WebP بحجم لا يتجاوز 5 ميجابايت.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    selectedFile.current = file;
    if (!ready) return;
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
      if (request.current !== xhr) return;
      setProgress(null);
      setError('تعذر رفع الصورة. أعد اختيارها للمحاولة مرة أخرى.');
    };
    xhr.onerror = failed;
    xhr.ontimeout = failed;
    xhr.onabort = () => setProgress(null);
    xhr.onload = () => {
      if (request.current !== xhr) return;
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
    body.append('depositAmountMinor', String(Math.round(depositAmount * 100)));
    if (orderID) body.append('orderID', orderID);
    else body.append('checkout', JSON.stringify(checkout));
    xhr.send(body);
  };
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className="space-y-4"
      aria-label="إثبات دفع العربون"
      aria-busy={progress !== null}
    >
      <div className="rounded-2xl border border-brand-500/25 bg-brand-500/5 p-4 space-y-2">
        <h3 className="font-semibold text-lg">
          {isPickup ? 'عربون تأكيد الحجز' : 'دفع مصاريف التوصيل'}
        </h3>
        <p className="text-sm text-text-secondary leading-7">
          {isPickup
            ? 'يرجى تحويل 100 جنيه لتأكيد الطلب ورفع صورة التحويل.'
            : 'يرجى تحويل قيمة مصاريف الشحن ورفع صورة إثبات التحويل لتأكيد الطلب.'}{' '}
          سيتم خصم المبلغ المدفوع من إجمالي الطلب، والمتبقي عند{' '}
          {isPickup ? 'الاستلام من المحل' : 'التوصيل'}.
        </p>
        <p className="text-sm text-text-muted">
          الصورة إثبات مساعد؛ يتم تأكيد التحويل بعد مراجعة المتجر.
        </p>
        {isPickup && (
          <p className="text-sm text-text-muted">الحد الأدنى لطلب الاستلام من المحل 100 جنيه.</p>
        )}
      </div>
      <dl className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-border bg-surface-secondary p-4 text-sm">
        {orderTotal !== undefined && (
          <div className="flex items-baseline justify-between gap-3 sm:block">
            <dt className="text-text-muted">إجمالي الطلب</dt>
            <dd className="mt-1 font-semibold">
              <Currency value={orderTotal} />
            </dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <dt className="text-text-muted">
            {isPickup ? 'قيمة العربون' : 'مصاريف التوصيل المطلوبة'}
          </dt>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.dd
              key={depositAmount}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.16 }}
              className="sm:mt-2 font-semibold text-brand-500"
            >
              <Currency value={depositAmount} />
            </motion.dd>
          </AnimatePresence>
        </div>
        {orderTotal !== undefined && (
          <div className="flex items-baseline justify-between gap-3 sm:block">
            <dt className="text-text-muted">المتبقي بعد تأكيد التحويل</dt>
            <dd className="sm:mt-2 font-semibold">
              <Currency value={Math.max(0, orderTotal - depositAmount)} />
            </dd>
          </div>
        )}
      </dl>
      {!loaded ? (
        <p role="status">جاري تحميل طرق الدفع…</p>
      ) : isError ? (
        <div
          role="status"
          className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm text-amber-200"
        >
          تعذر الاتصال بخدمة إعدادات الدفع. يرجى إعادة المحاولة قبل التحويل.
          <button type="button" onClick={() => void refetch()} className="block mt-2 underline">
            إعادة تحميل إعدادات الدفع
          </button>
        </div>
      ) : !methods.length ? (
        <p role="status" className="text-amber-300">
          لم يضبط المتجر حساب التحويل بعد. يمكنك اختيار الصورة، لكن لا يمكن رفع مطالبة دفع أو إتمام
          الطلب قبل إعداد الحساب. يرجى التواصل مع المتجر قبل التحويل.
        </p>
      ) : (
        <>
          <fieldset disabled={progress !== null || receiptFile !== null} className="space-y-3">
            <legend className="text-sm font-semibold mb-3">طريقة الدفع</legend>
            <div className={`grid gap-3 ${methods.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
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
        </>
      )}
      {config?.configuration?.uploadReady === false && (
        <p
          role="status"
          className="rounded-xl border border-amber-400/25 p-4 text-sm text-amber-200"
        >
          خدمة رفع إثبات التحويل غير مهيأة لدى المتجر. لا تحوّل المبلغ قبل تأكيد جاهزية الخدمة.
        </p>
      )}
      <motion.label
        animate={{ scale: dragging && !reducedMotion ? 1.01 : 1 }}
        whileHover={reducedMotion ? undefined : { borderColor: '#34d399' }}
        onDragOver={(event) => {
          event.preventDefault();
          if (progress === null) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files.length !== 1) {
            setError('يرجى اختيار صورة واحدة فقط.');
            return;
          }
          upload(event.dataTransfer.files[0]);
        }}
        className={`relative block cursor-pointer rounded-2xl border border-dashed p-5 bg-surface-secondary space-y-3 text-center transition-colors focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-950 ${dragging ? 'border-brand-500 bg-brand-500/10' : 'border-brand-500/40'}`}
      >
        <UploadCloud aria-hidden="true" className="mx-auto h-7 w-7 text-brand-500" />
        <span className="block text-sm font-semibold">صورة إثبات التحويل</span>
        <span className="inline-flex rounded-lg bg-brand-500/15 px-4 py-2 text-sm font-semibold text-brand-500">
          {preview ? 'اختيار صورة بديلة' : 'اختيار صورة التحويل'}
        </span>
        <input
          aria-label="اختيار صورة إثبات التحويل"
          aria-describedby="proof-help proof-error"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={progress !== null}
          onChange={(e) => {
            upload(e.target.files?.[0]);
            e.target.value = '';
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait"
        />
        <span id="proof-help" className="block text-xs text-text-muted">
          اسحب الصورة هنا أو اخترها من المعرض. JPEG، PNG أو WebP — حتى 5 ميجابايت.
        </span>
      </motion.label>
      {preview && !receiptFile && progress === null && (
        <button
          type="button"
          disabled={!ready}
          className="btn-secondary disabled:opacity-50"
          onClick={() => upload(selectedFile.current || undefined)}
        >
          {error ? 'إعادة محاولة الرفع' : 'رفع الصورة'}
        </button>
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
                const pending = request.current;
                request.current = null;
                pending?.abort();
                selectedFile.current = null;
                setProgress(null);
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
      <motion.div layout={!reducedMotion} role="status" aria-live="polite" className="text-sm">
        {progress !== null ? (
          <>
            <progress
              aria-label="تقدم رفع الصورة"
              max={100}
              value={progress}
              className="w-full accent-emerald-400"
            />
            {progress === 100 ? 'جاري فحص الصورة وحفظها…' : `جاري الرفع ${progress}%`}
          </>
        ) : receiptFile ? (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-500">
            تم حفظ الصورة بأمان. ستتم مراجعة التحويل بعد إرسال الطلب.
          </motion.span>
        ) : null}
      </motion.div>
      <motion.p
        layout={!reducedMotion}
        id="proof-error"
        role={error ? 'alert' : undefined}
        className={`text-sm ${error ? 'text-red-300' : 'text-text-muted'}`}
      >
        {error}
        {!receiptFile &&
          progress === null &&
          !error &&
          (isPickup
            ? 'يرجى رفع صورة تحويل عربون الحجز بقيمة 100 جنيه.'
            : 'يرجى رفع صورة تحويل مصاريف التوصيل لإتمام الطلب.')}
      </motion.p>
    </motion.section>
  );
}
