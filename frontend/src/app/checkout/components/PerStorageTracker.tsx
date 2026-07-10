'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import { parseCapacityGB, formatStorageCapacity } from '@/lib/storageUtils';
import type { Product } from '@/store/useStore';

const SUBTYPE_META: Record<string, { label: string; color: string; icon: string; gradient: string }> = {
  hdd: { 
    label: 'HDD', 
    color: '#f59e0b', 
    icon: 'CircleStackIcon',
    gradient: 'from-amber-500/20 to-orange-500/10'
  },
  ssd: { 
    label: 'SSD', 
    color: '#10b981', 
    icon: 'CpuChipIcon',
    gradient: 'from-emerald-500/20 to-teal-500/10'
  },
  nvme: { 
    label: 'NVMe', 
    color: '#6366f1', 
    icon: 'BoltIcon',
    gradient: 'from-indigo-500/20 to-purple-500/10'
  },
  'm.2': { 
    label: 'M.2', 
    color: '#8b5cf6', 
    icon: 'BoltIcon',
    gradient: 'from-violet-500/20 to-purple-500/10'
  },
};

function getSubtypeMeta(subtype: string) {
  const key = subtype.toLowerCase();
  for (const [k, v] of Object.entries(SUBTYPE_META)) {
    if (key.includes(k)) return v;
  }
  return { 
    label: subtype, 
    color: '#64748b', 
    icon: 'ServerIcon',
    gradient: 'from-slate-500/20 to-gray-500/10'
  };
}

export interface StorageDevice {
  id: string;
  name: string;
  subtype: string;
  capacityGB: number;
  quantity: number;
}

export interface DataItem {
  id: string;
  name: string;
  sizeGB: number;
  quantity: number;
  image?: string;
}

export interface StorageAssignment {
  storageId: string;
  dataId: string;
}

interface PerStorageTrackerProps {
  storageDevices: StorageDevice[];
  dataItems: DataItem[];
  assignments: StorageAssignment[];
  onAssignmentChange: (storageId: string, dataId: string, assigned: boolean) => void;
}

function formatGB(gb: number): string {
  if (gb === 0) return '0 GB';
  if (gb >= 1000) {
    const tb = gb / 1000;
    return `${Number.isInteger(tb) ? tb : tb.toFixed(1)} TB`;
  }
  return `${gb} GB`;
}

function GradientArc({ percentage, color }: { percentage: number; color: string }) {
  const r = 36;
  const cx = 44;
  const cy = 44;
  const circumference = 2 * Math.PI * r;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  const getColor = () => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return color;
  };

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="rotate-[-90deg]">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={getColor()}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease' }}
        filter={`drop-shadow(0 0 4px ${getColor()}88)`}
      />
    </svg>
  );
}

export default function PerStorageTracker({
  storageDevices,
  dataItems,
  assignments,
  onAssignmentChange,
}: PerStorageTrackerProps) {
  const [showDataSelector, setShowDataSelector] = useState<string | null>(null);

  // Calculate storage usage per device
  const storageStats = useMemo(() => {
    return storageDevices.map((device) => {
      const assignedData = assignments
        .filter((a) => a.storageId === device.id)
        .map((a) => {
          const dataItem = dataItems.find((d) => d.id === a.dataId);
          return dataItem ? { ...dataItem, assignment: a } : null;
        })
        .filter(Boolean) as (DataItem & { assignment: StorageAssignment })[];

      const usedGB = assignedData.reduce((acc, d) => acc + d.sizeGB * d.quantity, 0);
      const availableGB = Math.max(0, device.capacityGB * device.quantity - usedGB);
      const fillPercentage = device.capacityGB > 0
        ? Math.min(100, (usedGB / (device.capacityGB * device.quantity)) * 100)
        : 0;

      // Get unassigned data items that can fit
      const unassignedData = dataItems
        .filter((data) => !assignedData.some((ad) => ad.id === data.id))
        .map((data) => {
          const dataSize = data.sizeGB * data.quantity;
          return {
            ...data,
            canFit: dataSize <= availableGB,
            dataSize,
          };
        });

      return {
        ...device,
        assignedData,
        usedGB,
        availableGB,
        fillPercentage,
        unassignedData,
      };
    });
  }, [storageDevices, dataItems, assignments]);

  if (storageDevices.length === 0) return null;

  return (
    <div className="space-y-4" dir="rtl">
      {storageStats.map((device) => {
        const meta = getSubtypeMeta(device.subtype);
        const isFull = device.fillPercentage >= 100;
        const isNearFull = device.fillPercentage >= 90;
        const isSelectorOpen = showDataSelector === device.id;

        return (
          <div
            key={device.id}
            className="relative rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: `linear-gradient(135deg, ${meta.color}08 0%, rgba(255,255,255,0.03) 100%)`,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: `${meta.color}15`, 
                      border: `1px solid ${meta.color}30` 
                    }}
                  >
                    <Icon name={meta.icon} size={18} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary leading-none">
                      {device.name}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {device.quantity > 1 ? `${device.quantity} × ` : ''}{formatGB(device.capacityGB)}
                    </p>
                  </div>
                </div>

                <div
                  className="px-2.5 py-1 rounded-full text-[10px] font-black"
                  style={{
                    background: isFull ? 'rgba(239,68,68,0.15)' : isNearFull ? 'rgba(245,158,11,0.15)' : `${meta.color}15`,
                    border: `1px solid ${isFull ? 'rgba(239,68,68,0.3)' : isNearFull ? 'rgba(245,158,11,0.3)' : `${meta.color}30`}`,
                    color: isFull ? '#ef4444' : isNearFull ? '#f59e0b' : meta.color,
                  }}
                >
                  {Math.round(device.fillPercentage)}%
                </div>
              </div>

              {/* Storage Gauge */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <GradientArc percentage={device.fillPercentage} color={meta.color} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span 
                      className="text-sm font-black leading-none"
                      style={{ color: isFull ? '#ef4444' : isNearFull ? '#f59e0b' : meta.color }}
                    >
                      {Math.round(device.fillPercentage)}%
                    </span>
                    <span className="text-[8px] text-text-muted mt-0.5">ممتلئ</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Total Capacity */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">السعة الكلية</span>
                    <span className="text-xs font-bold text-text-primary">
                      {formatGB(device.capacityGB * device.quantity)}
                    </span>
                  </div>

                  {/* Used */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">مستخدم</span>
                    <span className={`text-xs font-bold ${isFull ? 'text-red-400' : isNearFull ? 'text-amber-400' : 'text-text-primary'}`}>
                      {formatGB(device.usedGB)}
                    </span>
                  </div>

                  {/* Available */}
                  <div
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                    style={{ 
                      background: device.availableGB > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${device.availableGB > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                    }}
                  >
                    <span className={`text-[10px] font-bold ${device.availableGB > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {device.availableGB > 0 ? 'متاح' : 'ممتلئ'}
                    </span>
                    <span className={`text-xs font-black ${device.availableGB > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatGB(device.availableGB)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Data Chips - Always Visible */}
            {device.assignedData.length > 0 && (
              <div className="px-4 pb-3">
                <p className="text-[10px] text-text-muted mb-2">البيانات المخزنة:</p>
                <div className="flex flex-wrap gap-2">
                  {device.assignedData.map((data) => (
                    <div
                      key={data.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                      style={{ 
                        background: `${meta.color}15`, 
                        border: `1px solid ${meta.color}25` 
                      }}
                    >
                      <Icon name="FolderIcon" size={12} style={{ color: meta.color }} />
                      <span className="text-[10px] text-text-primary line-clamp-1 max-w-[100px]">{data.name}</span>
                      <span className="text-[9px] text-text-muted">{formatGB(data.sizeGB * data.quantity)}</span>
                      <button
                        onClick={() => onAssignmentChange(device.id, data.id, false)}
                        className="p-0.5 rounded hover:bg-red-500/20 transition-colors ml-1"
                      >
                        <Icon name="XMarkIcon" size={10} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Selector Button */}
            {device.availableGB > 0 && device.unassignedData.length > 0 && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowDataSelector(isSelectorOpen ? null : device.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all"
                  style={{ 
                    background: isSelectorOpen ? `${meta.color}25` : `${meta.color}15`,
                    border: `1px solid ${isSelectorOpen ? `${meta.color}40` : `${meta.color}25`}`,
                    color: meta.color,
                  }}
                >
                  <Icon name={isSelectorOpen ? 'ChevronUpIcon' : 'PlusIcon'} size={14} />
                  <span>{isSelectorOpen ? 'إغلاق القائمة' : `إضافة داتا (${device.unassignedData.filter(d => d.canFit).length})`}</span>
                </button>

                {/* Data List - Expandable */}
                {isSelectorOpen && (
                  <div className="mt-3 space-y-2">
                    {device.unassignedData.map((data) => (
                      <button
                        key={data.id}
                        onClick={() => data.canFit && onAssignmentChange(device.id, data.id, true)}
                        disabled={!data.canFit}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                          data.canFit 
                            ? 'hover:bg-brand-500/10 cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        style={{ 
                          background: data.canFit ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${data.canFit ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)'}`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {data.image ? (
                            <img src={data.image} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-surface-tertiary flex items-center justify-center">
                              <Icon name="PhotoIcon" size={12} className="text-text-muted" />
                            </div>
                          )}
                          <div className="text-right">
                            <p className={`text-xs line-clamp-1 ${data.canFit ? 'text-text-primary' : 'text-text-muted'}`}>
                              {data.name}
                            </p>
                            <p className="text-[9px] text-text-muted">
                              {formatGB(data.dataSize)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {data.canFit ? (
                            <div 
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: `${meta.color}20` }}
                            >
                              <Icon name="PlusIcon" size={14} style={{ color: meta.color }} />
                            </div>
                          ) : (
                            <span className="text-[9px] text-red-400">لا تتسع</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Full Device Message */}
            {device.availableGB === 0 && (
              <div className="px-4 pb-4">
                <div className="text-center py-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <Icon name="NoSymbolIcon" size={16} className="text-red-400 mx-auto mb-1" />
                  <p className="text-[10px] text-red-400">الجهاز ممتلئ بالكامل</p>
                </div>
              </div>
            )}

            {/* No Available Data Message */}
            {device.availableGB > 0 && device.unassignedData.length === 0 && (
              <div className="px-4 pb-4">
                <div className="text-center py-3 rounded-xl bg-surface-tertiary/50 border border-white/5">
                  <Icon name="CheckCircleIcon" size={16} className="text-emerald-400 mx-auto mb-1" />
                  <p className="text-[10px] text-text-muted">تم إضافة جميع البيانات المتاحة</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
