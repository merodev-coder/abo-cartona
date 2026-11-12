'use client';
import { useState } from 'react';
import { getApiUrl } from '@/lib/apiConfig';
import { formatEGP } from '@/lib/checkoutSession';
import { depositLabels } from '@/lib/depositLabels';
interface Props {
  orderID: string;
  depositStatus: string;
  depositAmountMinor?: number;
  remainingBalanceMinor?: number;
  paymentMethod?: string;
  depositHistory?: { status: string; at: string; by: string; reason?: string }[];
}
export default function DepositReview(props: Props) {
  const [status, setStatus] = useState(props.depositStatus);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json',
  });
  async function view() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(getApiUrl(`orders/${props.orderID}/proof`), {
        headers: headers(),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر عرض الإثبات');
    } finally {
      setBusy(false);
    }
  }
  async function review(next: 'VERIFIED' | 'REJECTED') {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(getApiUrl(`orders/${props.orderID}/deposit`), {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ status: next, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus(data.depositStatus);
      setUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذرت مراجعة التحويل');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="rounded-2xl border border-brand-500/20 bg-surface-secondary p-5 space-y-4"
      aria-busy={busy}
    >
      <h2 className="text-lg font-semibold">مراجعة عربون الحجز</h2>
      <p role="status" className="text-brand-500">
        {depositLabels[status] || status}
      </p>
      <p className="text-sm">
        المبلغ: {formatEGP((props.depositAmountMinor || 0) / 100)} · المتبقي بعد التأكيد:{' '}
        {formatEGP((props.remainingBalanceMinor || 0) / 100)}
      </p>
      <p className="text-sm text-text-secondary">
        طريقة الدفع: <bdi>{props.paymentMethod}</bdi>
      </p>
      <p className="text-sm text-amber-300">
        راجع التحويل في حساب المتجر قبل الموافقة. الصورة وحدها لا تؤكد وصول الأموال.
      </p>
      <button type="button" className="btn-secondary" disabled={busy} onClick={view}>
        عرض إثبات الدفع بأمان
      </button>
      {url && (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            referrerPolicy="no-referrer"
            alt="إثبات التحويل المقدم للمراجعة"
            className="max-h-96 w-full object-contain rounded-xl"
          />
          <p className="text-xs text-text-muted">
            الرابط صالح لمدة دقيقة. أعد فتح الصورة إذا انتهت صلاحيته.
          </p>
        </div>
      )}
      {status === 'PENDING_VERIFICATION' && (
        <div className="space-y-3">
          <label className="block text-sm">
            سبب الرفض
            <textarea
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field w-full mt-2"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              className="btn-primary"
              onClick={() => review('VERIFIED')}
            >
              تأكيد وصول العربون
            </button>
            <button
              type="button"
              disabled={busy || !reason.trim()}
              className="btn-secondary text-red-300"
              onClick={() => review('REJECTED')}
            >
              رفض الإثبات
            </button>
          </div>
        </div>
      )}
      <p role="alert" className="text-sm text-red-300">
        {error}
      </p>
      {props.depositHistory?.length ? (
        <details>
          <summary className="cursor-pointer text-sm">سجل المراجعة</summary>
          <ul className="space-y-2 mt-3 text-sm text-text-secondary">
            {props.depositHistory.map((entry, i) => (
              <li key={i}>
                {depositLabels[entry.status] || entry.status} · <bdi>{entry.by}</bdi> ·{' '}
                {new Date(entry.at).toLocaleString('ar-EG')} {entry.reason && `— ${entry.reason}`}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
