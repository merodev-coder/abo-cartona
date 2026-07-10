'use client';

import React, { useState } from 'react';
import { useStorageTracker, formatGB } from '@/hooks/useStorageTracker';
import Icon from '@/components/ui/AppIcon';

const SUBTYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  hdd: { label: 'HDD', color: '#f59e0b', icon: 'CircleStackIcon' },
  ssd: { label: 'SSD', color: '#10b981', icon: 'CpuChipIcon' },
  nvme: { label: 'NVMe', color: '#6366f1', icon: 'BoltIcon' },
  'm.2': { label: 'M.2', color: '#8b5cf6', icon: 'BoltIcon' },
};

function getSubtypeMeta(subtype: string) {
  const key = subtype.toLowerCase();
  for (const [k, v] of Object.entries(SUBTYPE_META)) {
    if (key.includes(k)) return v;
  }
  return { label: subtype, color: '#64748b', icon: 'ServerIcon' };
}

function GradientArc({ percentage }: { percentage: number }) {
  const r = 52;
  const cx = 64;
  const cy = 64;
  const circumference = 2 * Math.PI * r;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  const getColor = () => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return '#6366f1';
  };

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" className="rotate-[-90deg]">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={getColor()}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease' }}
        filter={`drop-shadow(0 0 6px ${getColor()}88)`}
      />
    </svg>
  );
}

export default function StorageTracker() {
  const { totalStorageGB, usedStorageGB, availableStorageGB, breakdown, fillPercentage, hasStorage } =
    useStorageTracker();
  const [expanded, setExpanded] = useState(false);

  if (!hasStorage) return null;

  const fillColor =
    fillPercentage >= 90 ? 'text-red-400' : fillPercentage >= 70 ? 'text-amber-400' : 'text-indigo-400';

  return (
    <div
      dir="rtl"
      className="relative rounded-3xl overflow-hidden border border-white/10"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(16,185,129,0.05) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.07) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <Icon name="ServerStackIcon" size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-black text-text-primary leading-none">مساحة التخزين</p>
              <p className="text-[10px] text-text-muted mt-0.5">Storage Tracker</p>
            </div>
          </div>

          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#818cf8',
            }}
          >
            {breakdown.length} {breakdown.length === 1 ? 'جهاز' : 'أجهزة'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <GradientArc percentage={fillPercentage} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-lg font-black leading-none ${fillColor}`}>
                {Math.round(fillPercentage)}%
              </span>
              <span className="text-[9px] text-text-muted mt-0.5">ممتلئ</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2.5">
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] text-text-muted">إجمالي المساحة</span>
                <span className="text-sm font-black text-text-primary">{formatGB(totalStorageGB)}</span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div className="h-full rounded-full bg-indigo-500" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[10px] text-text-muted">مستخدم (DATA)</span>
                <span className="text-sm font-black text-amber-400">{formatGB(usedStorageGB)}</span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${fillPercentage}%`,
                    background:
                      fillPercentage >= 90
                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                        : fillPercentage >= 70
                        ? 'linear-gradient(90deg, #10b981, #f59e0b)'
                        : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    boxShadow:
                      fillPercentage >= 90
                        ? '0 0 8px rgba(239,68,68,0.5)'
                        : '0 0 8px rgba(99,102,241,0.4)',
                  }}
                />
              </div>
            </div>

            <div
              className="flex items-center justify-between px-3 py-2 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <span className="text-[10px] text-emerald-400 font-bold">متاح لـ DATA</span>
              <span className="text-sm font-black text-emerald-400">{formatGB(availableStorageGB)}</span>
            </div>
          </div>
        </div>

        {breakdown.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1.5 text-[10px] text-text-muted hover:text-text-primary transition-colors w-full"
            >
              <Icon
                name={expanded ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                size={12}
                className="flex-shrink-0"
              />
              <span>{expanded ? 'إخفاء التفاصيل' : 'عرض تفاصيل الأجهزة'}</span>
              <div className="flex-1 h-px ml-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </button>

            {expanded && (
              <div className="mt-3 space-y-2">
                {breakdown.map((item, i) => {
                  const meta = getSubtypeMeta(item.subtype);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
                      >
                        <Icon name={meta.icon} size={12} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-text-primary leading-none line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[9px] text-text-muted mt-0.5">
                          {item.quantity} × {formatGB(item.capacityGB)}
                        </p>
                      </div>
                      <span
                        className="text-xs font-black flex-shrink-0"
                        style={{ color: meta.color }}
                      >
                        {formatGB(item.totalCapacityGB)}
                      </span>
                    </div>
                  );
                })}

                <div
                  className="flex items-center justify-between px-3 py-2 rounded-xl mt-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}
                >
                  <span className="text-[10px] font-black text-indigo-400">الإجمالي الكلي</span>
                  <span className="text-sm font-black text-indigo-400">{formatGB(totalStorageGB)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {availableStorageGB > 0 && (
          <div
            className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: 'rgba(99,102,241,0.07)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <Icon name="SparklesIcon" size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-text-muted leading-relaxed">
              لديك{' '}
              <span className="font-black text-indigo-400">{formatGB(availableStorageGB)}</span>{' '}
              متاحة — أضف منتجات{' '}
              <span className="font-black text-emerald-400">DATA</span>{' '}
              (ألعاب، أفلام، إلخ.) لملء مساحتك مجاناً!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
