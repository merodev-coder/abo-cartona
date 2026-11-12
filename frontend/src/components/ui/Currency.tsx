import { formatEGPNumber } from '@/lib/currency';

export default function Currency({ value }: { value: number }) {
  return (
    <span
      dir="ltr"
      className="inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums"
      aria-label={`${formatEGPNumber(value)} جنيه مصري`}
    >
      <bdi dir="ltr">{formatEGPNumber(value)}</bdi>
      <span dir="rtl" aria-hidden="true">
        ج.م
      </span>
    </span>
  );
}
