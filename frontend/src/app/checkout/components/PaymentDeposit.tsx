'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getApiUrl } from '@/lib/apiConfig';
import { checkoutToken } from '@/lib/checkoutSession';
import Currency from '@/components/ui/Currency';
import { UploadCloud, Smartphone, Wallet, Check, Copy } from 'lucide-react';
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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );
  const chooseMethod = (id: string) => {
    if (id === selectedMethod) return;
    const pending = request.current;
    request.current = null;
    pending?.abort();
    selectedFile.current = null;
    setProgress(null);
    setPreview(null);
    onReceiptUpload(null);
    setError('');
    setCopyStatus('idle');
    setMethod(id);
  };
  const copyDestination = async () => {
    if (!active) return;
    try {
      const value = /^\+?[\d ()-]+$/.test(active.destination)
        ? active.destination.replace(/[ ()-]/g, '')
        : active.destination;
      await navigator.clipboard.writeText(value);
      setCopyStatus('copied');
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopyStatus('idle'), 3000);
    } catch {
      setCopyStatus('error');
    }
  };
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
        const result: { proofId?: string; error?: string; code?: string } = JSON.parse(
          xhr.responseText
        );
        if (xhr.status >= 200 && xhr.status < 300 && result.proofId)
          onReceiptUpload(result.proofId);
        else
          setError(
            result.code
              ? `${result.error || 'تعذر رفع الصورة.'} (رمز: ${result.code})`
              : result.error || 'تعذر رفع الصورة.'
          );
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
        <p
          role="status"
          className="rounded-xl border border-border p-4 text-sm text-text-secondary"
        >
          طرق التحويل غير متاحة حالياً. يرجى التواصل مع المتجر لتأكيد بيانات الدفع.
        </p>
      ) : (
        <>
          <fieldset disabled={progress !== null} className="space-y-3">
            <legend className="text-sm font-semibold mb-3">طريقة الدفع</legend>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'vodafone', name: 'فودافون كاش', latin: 'Vodafone Cash', Icon: Smartphone },
                { id: 'instapay', name: 'إنستاباي', latin: 'InstaPay', Icon: Wallet },
              ].map((m) => {
                const available = methods.some((candidate) => candidate.id === m.id);
                const selected = selectedMethod === m.id && available;
                return (
                  <motion.label
                    key={m.id}
                    animate={{
                      borderColor: selected
                        ? 'var(--color-brand-500, #10b981)'
                        : 'var(--color-border, #263244)',
                    }}
                    transition={{ duration: reducedMotion ? 0 : 0.18 }}
                    className={`relative flex flex-col gap-2 min-w-0 p-3 sm:p-4 rounded-xl border focus-within:ring-2 focus-within:ring-brand-500 ${selected ? 'bg-brand-500/10' : 'bg-surface-secondary'} ${available ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    <input
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                      type="radio"
                      name="payment-method"
                      value={m.id}
                      disabled={!available}
                      checked={selected}
                      onChange={() => chooseMethod(m.id)}
                      aria-label={`${m.name} ${m.latin}`}
                    />
                    <span className="flex items-center justify-between gap-2">
                      <m.Icon aria-hidden="true" className="h-5 w-5 text-brand-500" />
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-brand-500 bg-brand-500 text-slate-950' : 'border-border'}`}
                      >
                        {selected && (
                          <motion.span
                            initial={{ scale: reducedMotion ? 1 : 0.8 }}
                            animate={{ scale: 1 }}
                          >
                            <Check aria-hidden="true" size={14} />
                          </motion.span>
                        )}
                      </span>
                    </span>
                    <span className="text-sm font-semibold">{m.name}</span>
                    <span dir="ltr" className="text-xs text-text-muted text-start">
                      {m.latin}
                    </span>
                    {!available && <span className="text-xs text-text-muted">غير متاح حالياً</span>}
                  </motion.label>
                );
              })}
            </div>
          </fieldset>
          <AnimatePresence mode="wait" initial={false}>
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.16 }}
                className="rounded-xl border border-border p-4 space-y-3"
              >
                <h4 className="text-sm font-semibold">
                  التحويل عبر {active.id === 'vodafone' ? 'فودافون كاش' : 'إنستاباي'}
                </h4>
                <p className="text-sm text-text-secondary">
                  حول قيمة العربون المطلوبة إلى الرقم التالي:
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <bdi
                    dir="ltr"
                    className="font-semibold text-lg break-all select-all tabular-nums"
                  >
                    {active.destination}
                  </bdi>
                  <button
                    type="button"
                    onClick={() => void copyDestination()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 text-sm text-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                  >
                    <motion.span
                      key={copyStatus}
                      initial={{ scale: reducedMotion ? 1 : 0.85 }}
                      animate={{ scale: 1 }}
                    >
                      {copyStatus === 'copied' ? (
                        <Check aria-hidden="true" size={16} />
                      ) : (
                        <Copy aria-hidden="true" size={16} />
                      )}
                    </motion.span>
                    {copyStatus === 'copied' ? 'تم نسخ الرقم' : 'نسخ الرقم'}
                  </button>
                </div>
                <p role="status" className="text-xs text-text-muted">
                  {copyStatus === 'error'
                    ? 'تعذر النسخ. يمكنك تحديد الرقم ونسخه يدوياً.'
                    : copyStatus === 'copied'
                      ? 'تم نسخ الرقم'
                      : ''}
                </p>
                <div className="border-t border-border pt-3 text-sm leading-7 text-text-secondary">
                  <p className="mb-2 font-semibold text-text-primary">
                    المبلغ المطلوب: <Currency value={depositAmount} />
                  </p>
                  <ol className="list-decimal ps-5 space-y-1">
                    <li>حول قيمة العربون الموضحة إلى الرقم المعروض.</li>
                    <li>احتفظ بصورة تأكيد التحويل.</li>
                    <li>ارفع صورة التحويل في المربع بالأسفل.</li>
                    <li>أرسل الطلب وانتظر مراجعة التحويل من المتجر.</li>
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
      {config?.configuration?.proofAcl === 'public' && (
        <p role="note" className="text-xs leading-5 text-amber-200">
          تنبيه: رابط صورة التحويل عام؛ يمكن لأي شخص لديه الرابط الاطلاع عليها.
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
      <p className="text-xs leading-6 text-text-muted">
        الصورة إثبات مساعد؛ يتم تأكيد استلام المبلغ بعد مراجعة التحويل من المتجر.
      </p>
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
