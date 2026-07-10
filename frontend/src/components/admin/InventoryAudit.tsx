'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface ProductPerformance {
  name: string;
  quantity: number;
  revenue: number;
  productCost: number;
  profit: number;
  category: string;
  image: string | null;
  stockCount: number;
  productId?: string;
  salesProgress: number;
}

interface InventorySummary {
  totalRevenue: number;
  totalItems: number;
  totalProductCost: number;
  totalOperationalCost: number;
  netProfit: number;
  netProfitEstimate: number;
  orderCount: number;
}

interface InventoryData {
  summary: InventorySummary;
  productPerformance: ProductPerformance[];
  month: number;
  year: number;
}

const MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'إبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const CATEGORY_LABELS: Record<string, string> = {
  laptops: 'لابتوب',
  accessories: 'إكسسوار',
  storage: 'قطع كمبيوتر',
  data: 'داتا',
  unknown: 'غير معروف',
};

// Animated number component
function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const spring = useSpring(value, { stiffness: 100, damping: 30, duration: 1.5 });
  const display = useTransform(spring, (current) => {
    if (value >= 1000000) {
      return Math.round(current).toLocaleString('ar-EG');
    }
    return Math.round(current).toLocaleString('ar-EG');
  });

  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(v));
    return unsubscribe;
  }, [display]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
  prefix = '',
  suffix = '',
  delay = 0,
}: {
  label: string;
  value: number;
  icon: string;
  color: 'emerald' | 'indigo' | 'amber' | 'rose';
  prefix?: string;
  suffix?: string;
  delay?: number;
}) {
  const colorClasses = {
    emerald: {
      bg: 'bg-brand-500/10 bg-brand-400/10',
      text: 'text-brand-600 text-brand-400',
      icon: 'text-brand-500 text-brand-400',
      border: 'border-emerald-500/20 dark:border-emerald-400/20',
    },
    indigo: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-400/10',
      text: 'text-indigo-600 dark:text-indigo-400',
      icon: 'text-indigo-500 dark:text-indigo-400',
      border: 'border-indigo-500/20 dark:border-indigo-400/20',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-400/10',
      text: 'text-amber-600 dark:text-amber-400',
      icon: 'text-amber-500 dark:text-amber-400',
      border: 'border-amber-500/20 dark:border-amber-400/20',
    },
    rose: {
      bg: 'bg-rose-500/10 dark:bg-rose-400/10',
      text: 'text-rose-600 dark:text-rose-400',
      icon: 'text-rose-500 dark:text-rose-400',
      border: 'border-rose-500/20 dark:border-rose-400/20',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-2xl border ${colorClasses[color].border} bg-surface-secondary p-6`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-text-muted text-text-muted mb-1">{label}</p>
          <p className={`text-h2 font-bold ${colorClasses[color].text}`}>
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${colorClasses[color].bg} flex items-center justify-center`}
        >
          <Icon name={icon as any} size={24} className={colorClasses[color].icon} />
        </div>
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ month, year }: { month: number; year: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-24 h-24 rounded-3xl bg-surface-tertiary bg-surface-tertiary flex items-center justify-center mb-6">
        <Icon name="ChartBarIcon" size={40} className="text-text-muted text-text-muted" />
      </div>
      <h3 className="text-h3 text-text-primary text-text-primary mb-2">لا توجد مبيعات</h3>
      <p className="text-body-sm text-text-muted text-text-muted text-center max-w-md">
        لا توجد بيانات مبيعات لشهر {MONTHS_AR[month - 1]} {year}. جرب اختيار شهر آخر أو تحقق من حالة
        الطلبات في قسم الطلبات.
      </p>
    </motion.div>
  );
}

// Product Row Component
function ProductRow({
  product,
  index,
  maxQuantity,
}: {
  product: ProductPerformance;
  index: number;
  maxQuantity: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group grid grid-cols-12 gap-4 items-center p-4 rounded-xl hover:bg-surface-secondary dark:hover:bg-white/[0.02] transition-colors border-b border-border-light border-border last:border-b-0"
    >
      {/* Product Info */}
      <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-surface-tertiary bg-surface-tertiary overflow-hidden flex-shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="PhotoIcon" size={20} className="text-text-muted" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-body-sm font-semibold text-text-primary text-text-primary truncate">
            {product.name}
          </p>
          <span className="text-caption text-text-muted text-text-muted">
            {CATEGORY_LABELS[product.category] || product.category}
          </span>
        </div>
      </div>

      {/* Quantity - Updated to col-span-3 */}
      <div className="col-span-3 sm:col-span-2 text-center">
        <p className="text-body font-bold text-text-primary text-text-primary">
          {product.quantity.toLocaleString('ar-EG')}
        </p>
        <p className="text-caption text-text-muted text-text-muted">قطعة</p>
      </div>

      {/* Revenue - Updated to col-span-3 */}
      <div className="col-span-3 sm:col-span-2 text-center">
        <p className="text-body font-bold text-brand-600 text-brand-400">
          {product.revenue.toLocaleString('ar-EG')}
        </p>
        <p className="text-caption text-text-muted text-text-muted">إيرادات</p>
      </div>

      {/* Product Cost & Profit - Desktop */}
      <div className="hidden sm:flex col-span-4 items-center gap-4">
        <div className="flex-1 text-center">
          <p className="text-body-sm font-bold text-rose-500 dark:text-rose-400">
            {product.productCost.toLocaleString('ar-EG')}
          </p>
          <p className="text-caption text-text-muted text-text-muted">تكلفة</p>
        </div>
        <div className="flex-1 text-center">
          <p
            className={`text-body-sm font-bold ${product.profit >= 0 ? 'text-brand-600 text-brand-400' : 'text-rose-500 dark:text-rose-400'}`}
          >
            {product.profit.toLocaleString('ar-EG')}
          </p>
          <p className="text-caption text-text-muted text-text-muted">ربح</p>
        </div>
      </div>

      {/* Cost & Profit - Mobile */}
      <div className="col-span-6 sm:hidden text-center">
        <p className="text-body-sm font-bold text-rose-500 dark:text-rose-400">
          {product.productCost.toLocaleString('ar-EG')}
        </p>
        <p className="text-caption text-text-muted text-text-muted">تكلفة</p>
      </div>
      <div className="col-span-6 sm:hidden text-center">
        <p
          className={`text-body-sm font-bold ${product.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}
        >
          {product.profit.toLocaleString('ar-EG')}
        </p>
        <p className="text-caption text-text-muted text-text-muted">ربح</p>
      </div>

      {/* Stock Status */}
      <div className="col-span-12 sm:col-span-1 text-center">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-caption font-semibold ${
            product.stockCount > 10
              ? 'bg-brand-100 text-brand-700 bg-brand-400/15 text-brand-400'
              : product.stockCount > 0
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-400'
          }`}
        >
          {product.stockCount > 0 ? product.stockCount : 'نفد'}
        </span>
      </div>
    </motion.div>
  );
}

// Main Component
export default function InventoryAudit() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inventory?month=${month}&year=${year}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    if (!data) return;
    setExporting(true);

    // Generate CSV content
    const headers = [
      'المنتج',
      'الفئة',
      'الكمية المباعة',
      'الإيرادات',
      'تكلفة المنتج',
      'الربح',
      'المخزون المتبقي',
    ];
    const rows = data.productPerformance.map((p) => [
      p.name,
      CATEGORY_LABELS[p.category] || p.category,
      p.quantity,
      p.revenue,
      p.productCost,
      p.profit,
      p.stockCount,
    ]);

    const summaryRows = [
      [],
      ['الملخص'],
      ['إجمالي الإيرادات', data.summary.totalRevenue],
      ['إجمالي القطع المباعة', data.summary.totalItems],
      ['إجمالي تكلفة المنتجات', data.summary.totalProductCost],
      ['تكلفة التشغيلية', data.summary.totalOperationalCost],
      ['صافي الربح', data.summary.netProfit],
      ['عدد الطلبات', data.summary.orderCount],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
      ...summaryRows.map((r) => r.join(',')),
    ].join('\n');

    // Download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `الجرد_${MONTHS_AR[month - 1]}_${year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExporting(false);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-h3 text-text-primary text-text-primary flex items-center gap-2">
            <Icon name="ClipboardDocumentListIcon" size={24} className="text-brand-500" />
            الجرد الشهري
          </h2>
          <p className="text-body-sm text-text-muted text-text-muted mt-1">
            تحليل المبيعات والأداء الشهري
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <CustomDropdown
              options={MONTHS_AR.map((m, i) => ({ value: String(i + 1), label: m }))}
              value={String(month)}
              onChange={(value) => setMonth(parseInt(value))}
              className="w-32"
              size="sm"
            />
            <CustomDropdown
              options={years.map((y) => ({ value: String(y), label: String(y) }))}
              value={String(year)}
              onChange={(value) => setYear(parseInt(value))}
              className="w-28"
              size="sm"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || !data || data.productPerformance.length === 0}
            className="btn-ghost px-4 py-2.5 text-body-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Icon
              name={exporting ? 'ArrowPathIcon' : 'DocumentArrowDownIcon'}
              size={16}
              className={exporting ? 'animate-spin' : ''}
            />
            تصدير CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : !data || data.productPerformance.length === 0 ? (
        <div className="bg-surface-secondary rounded-2xl border border-border">
          <EmptyState month={month} year={year} />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="إجمالي الإيرادات"
              value={data.summary.totalRevenue}
              icon="BanknotesIcon"
              color="emerald"
              suffix=" جنيه"
              delay={0}
            />
            <StatCard
              label="إجمالي القطع المباعة"
              value={data.summary.totalItems}
              icon="ShoppingCartIcon"
              color="indigo"
              delay={0.1}
            />
            <StatCard
              label="تكلفة المنتجات"
              value={data.summary.totalProductCost}
              icon="CubeIcon"
              color="rose"
              suffix=" جنيه"
              delay={0.15}
            />
            <StatCard
              label="تكلفة التشغيلية"
              value={data.summary.totalOperationalCost}
              icon="WrenchScrewdriverIcon"
              color="amber"
              suffix=" جنيه"
              delay={0.2}
            />
            <StatCard
              label="صافي الربح"
              value={data.summary.netProfit}
              icon="TrendingUpIcon"
              color="emerald"
              prefix={data.summary.netProfit >= 0 ? '+ ' : '- '}
              suffix=" جنيه"
              delay={0.25}
            />
            <StatCard
              label="عدد الطلبات"
              value={data.summary.orderCount}
              icon="ShoppingBagIcon"
              color="rose"
              delay={0.3}
            />
          </div>

          {/* Product Performance Table */}
          <div className="bg-surface-secondary rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border-light border-border">
              <h3 className="text-body font-bold text-text-primary text-text-primary flex items-center gap-2">
                <Icon name="ChartPieIcon" size={18} className="text-brand-500" />
                أداء المنتجات
              </h3>
            </div>

            {/* Table Header - Desktop - Updated grid */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-surface-secondary bg-surface-tertiary/50 text-caption font-semibold text-text-muted text-text-muted">
              <div className="col-span-4">المنتج</div>
              <div className="col-span-2 text-center">الكمية</div>
              <div className="col-span-2 text-center">الإيرادات</div>
              <div className="col-span-2 text-center">التكلفة</div>
              <div className="col-span-1 text-center">الربح</div>
              <div className="col-span-1 text-center">المخزون</div>
            </div>

            {/* Product Rows */}
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {data.productPerformance.map((product, index) => (
                <ProductRow
                  key={product.name}
                  product={product}
                  index={index}
                  maxQuantity={data.productPerformance[0]?.quantity || 1}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
