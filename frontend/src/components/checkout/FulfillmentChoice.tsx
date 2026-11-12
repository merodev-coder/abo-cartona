'use client';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { motionTokens } from '@/lib/motionTokens';
export default function FulfillmentChoice({
  value,
  onChange,
}: {
  value: 'pickup' | 'delivery';
  onChange: (value: 'pickup' | 'delivery') => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">طريقة استلام الطلب</legend>
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
        {(
          [
            {
              id: 'delivery',
              icon: 'TruckIcon',
              title: 'توصيل للمنزل',
              description: 'رسوم الشحن حسب المحافظة',
            },
            {
              id: 'pickup',
              icon: 'BuildingStorefrontIcon',
              title: 'استلام من المحل',
              description: 'عربون 100 جنيه يخصم من الإجمالي',
            },
          ] as const
        ).map((option) => (
          <motion.label
            key={option.id}
            whileTap={{ scale: 0.985 }}
            transition={motionTokens.spring}
            className={`selection-card relative flex flex-col gap-3 min-h-40 rounded-2xl border p-5 cursor-pointer transition-colors ${value === option.id ? 'border-brand-500 bg-brand-500/10' : 'border-border bg-surface-secondary hover:border-brand-500/40'}`}
          >
            <div className="flex justify-between items-center">
              <span className="rounded-xl bg-brand-500/10 p-2.5">
                <Icon name={option.icon} size={24} className="text-brand-500" />
              </span>
              <input
                type="radio"
                name="fulfillment"
                value={option.id}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
                className="h-5 w-5 accent-emerald-400"
              />
            </div>
            <div>
              <span className="block font-semibold text-base">{option.title}</span>
              <span className="block text-sm text-text-secondary mt-1 leading-6">
                {option.description}
              </span>
            </div>
          </motion.label>
        ))}
      </div>
    </fieldset>
  );
}
