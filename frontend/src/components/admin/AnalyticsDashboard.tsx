'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { getAdminApiUrl } from '@/lib/apiConfig';
import CustomDropdown from '@/components/ui/CustomDropdown';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';

interface MonthlyData {
  month: number;
  year: number;
  monthName: string;
  revenue: number;
  productCost: number;
  operationalCost: number;
  netProfit: number;
  itemsSold: number;
  itemsRestocked: number;
  ordersCount: number;
  productAudit: ProductAudit[];
}

interface ProductAudit {
  productId: string;
  productName: string;
  itemsSold: number;
  currentStock: number;
  revenue: number;
  cost: number;
  netProfit: number;
}

interface YearlyData {
  year: number;
  months: MonthlyData[];
  yearlyTotals: {
    revenue: number;
    productCost: number;
    operationalCost: number;
    netProfit: number;
    itemsSold: number;
    itemsRestocked: number;
    ordersCount: number;
  };
}

interface TopSellingItem {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

interface ExportOrder {
  orderID: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  shippingCost: number;
  requiredDeposit: number;
  orderDate: string;
  orderStatus: string;
  totalPrice: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

// Custom tooltip for charts with RTL support
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-secondary border border-border-light border-border rounded-xl p-4 shadow-elevated">
        <p className="text-body-sm font-semibold text-text-primary text-text-primary mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-caption">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-text-muted text-text-muted">{entry.name}:</span>
            <span className="font-semibold text-text-primary text-text-primary">
              {entry.value?.toLocaleString('ar-EG')}{' '}
              {entry.name.includes('الإيرادات') || entry.name.includes('الربح') ? 'جنيه' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
  accentColor = 'brand',
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  accentColor?: 'brand' | 'indigo' | 'amber' | 'emerald';
  delay?: number;
}) => {
  const accentColors = {
    brand: 'from-brand-500 to-brand-400',
    indigo: 'from-indigo-500 to-indigo-400',
    amber: 'from-amber-500 to-amber-400',
    emerald: 'from-emerald-500 to-emerald-400',
  };

  const bgColors = {
    brand: 'bg-brand-50 dark:bg-brand-500/10',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10',
    amber: 'bg-amber-50 dark:bg-amber-500/10',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10',
  };

  const textColors = {
    brand: 'text-brand-600 text-brand-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="stat-card glass-card relative overflow-hidden group"
    >
      {/* Gradient accent strip at top */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColors[accentColor]}`}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${bgColors[accentColor]} flex items-center justify-center`}
        >
          <Icon name={icon as any} size={22} className={textColors[accentColor]} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium ${
              trendUp
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
            }`}
          >
            <Icon
              name={trendUp ? 'ArrowTrendingUpIcon' : ('ArrowTrendingDownIcon' as any)}
              size={14}
            />
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-caption text-text-muted text-text-muted">{title}</p>
        <p className={`text-h2 font-bold ${textColors[accentColor]}`}>{value}</p>
        <p className="text-caption text-text-muted text-text-muted">{subtitle}</p>
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-elevated/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </motion.div>
  );
};

// Top Selling Items Component
const TopSellingItems = ({ year }: { year: number }) => {
  const [items, setItems] = useState<TopSellingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSelling = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(getAdminApiUrl(`top-selling?year=${year}&limit=8`), { headers });
        if (res.ok) {
          const data = await res.json();
          setItems(data.topSelling || []);
        }
      } catch (err) {
        console.error('Error fetching top selling:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSelling();
  }, [year]);

  if (loading) {
    return (
      <div className="bg-surface-secondary rounded-2xl p-6 border border-border-light border-border">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-surface-secondary rounded-2xl p-6 border border-border-light border-border">
        <div className="text-center py-6">
          <Icon name="ChartPieIcon" size={32} className="text-text-muted mx-auto mb-2" />
          <p className="text-body-sm text-text-muted text-text-muted">لا توجد بيانات مبيعات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary rounded-2xl p-5 border border-border-light border-border">
      <h3 className="text-body font-bold text-text-primary text-text-primary mb-4 flex items-center gap-2">
        <Icon name="TrophyIcon" size={18} className="text-amber-500" />
        الأكثر مبيعاً
      </h3>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.productId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-tertiary/50 hover:bg-surface-tertiary dark:hover:bg-white/[0.03] transition-colors"
          >
            {/* Rank */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-body-sm font-bold ${
                index === 0
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  : index === 1
                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'
                    : index === 2
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400'
              }`}
            >
              {index + 1}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold text-text-primary text-text-primary truncate">
                {item.name}
              </p>
              <div className="flex items-center gap-3 text-caption text-text-muted text-text-muted">
                <span className="flex items-center gap-1">
                  <Icon name="ShoppingBagIcon" size={12} />
                  {item.totalSold} مباع
                </span>
              </div>
            </div>

            {/* Revenue */}
            <div className="text-left">
              <p className="text-body-sm font-bold text-brand-600 text-brand-400">
                {item.totalRevenue.toLocaleString('ar-EG')}
              </p>
              <p className="text-caption text-text-muted">جنيه</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Export Button Component
const ExportButton = ({ year, onExport }: { year: number; onExport: () => void }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(getAdminApiUrl(`orders-export?year=${year}`), { headers });
      if (res.ok) {
        const data = await res.json();
        generateExcel(data.orders, year);
        onExport();
      }
    } catch (err) {
      console.error('Error exporting:', err);
    } finally {
      setExporting(false);
    }
  };

  const generateExcel = (orders: ExportOrder[], year: number) => {
    // CSV format with BOM for Arabic support
    const BOM = '\uFEFF';
    const headers = [
      'رقم الطلب',
      'اسم العميل',
      'رقم الهاتف',
      'العنوان',
      'المحافظة / طريقة الشحن',
      'تكلفة الشحن',
      'العربون المدفوع',
      'المنتج',
      'الكمية',
      'سعر الوحدة',
      'إجمالي البند',
      'إجمالي الطلب',
      'الحالة',
      'التاريخ',
    ];

    const rows = orders.map((order) => [
      order.orderID,
      order.customerName,
      order.customerPhone,
      order.customerAddress,
      order.customerCity,
      order.shippingCost,
      order.requiredDeposit,
      order.productName,
      order.quantity,
      order.unitPrice,
      order.itemTotal,
      order.totalPrice,
      order.orderStatus === 'Completed'
        ? 'مكتمل'
        : order.orderStatus === 'Pending'
          ? 'معلق'
          : order.orderStatus === 'Cancelled'
            ? 'ملغي'
            : order.orderStatus,
      new Date(order.orderDate).toLocaleDateString('ar-EG'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="group relative flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 hover:border-brand-500/60 text-brand-400 hover:text-brand-300 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-l from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      {exporting ? (
        <div className="w-3.5 h-3.5 border-2 border-brand-400/40 border-t-brand-400 rounded-full animate-spin flex-shrink-0" />
      ) : (
        <Icon name="ArrowDownTrayIcon" size={15} className="flex-shrink-0" />
      )}
      <span className="relative">{exporting ? 'جاري التصدير...' : 'تصدير CSV'}</span>
    </button>
  );
};

export default function MonthlySalesPerformance() {
  const [data, setData] = useState<YearlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(getAdminApiUrl(`monthly-performance?year=${year}`), { headers });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching monthly performance:', err);
    } finally {
      setLoading(false);
    }
  }, [year]);

  const fetchAudit = useCallback(
    async (month: number) => {
      setAuditLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(getAdminApiUrl(`monthly-audit?year=${year}&month=${month}`), {
          headers,
        });
        if (res.ok) {
          const result = await res.json();
          setAuditData(result);
        }
      } catch (err) {
        console.error('Error fetching monthly audit:', err);
      } finally {
        setAuditLoading(false);
      }
    },
    [year]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMonthClick = (month: number) => {
    if (selectedMonth === month) {
      setSelectedMonth(null);
      setAuditData(null);
    } else {
      setSelectedMonth(month);
      fetchAudit(month);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.months.map((m) => ({
      name: m.monthName.slice(0, 3),
      monthName: m.monthName,
      month: m.month,
      الإيرادات: m.revenue,
      الربح: m.netProfit,
      الطلبات: m.ordersCount,
      القطع: m.itemsSold,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.months.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 px-4 bg-surface-secondary rounded-2xl border border-border-light border-border"
      >
        <div className="w-24 h-24 rounded-3xl bg-surface-tertiary flex items-center justify-center mb-6">
          <Icon name="ChartBarIcon" size={40} className="text-text-muted" />
        </div>
        <h3 className="text-h3 text-text-primary text-text-primary mb-2">لا توجد بيانات</h3>
        <p className="text-body-sm text-text-muted text-text-muted text-center max-w-md">
          لا توجد بيانات مبيعات لسنة {year}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with Year Selector and Export */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-h3 text-text-primary text-text-primary flex items-center gap-2">
            <Icon name="ChartBarIcon" size={24} className="text-brand-500" />
            تحليل المبيعات والأداء
          </h2>
          <p className="text-body-sm text-text-muted text-text-muted mt-1">
            متابعة إجمالي الدخل والطلبات والقطع المباعة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CustomDropdown
            value={String(year)}
            onChange={(value) => setYear(parseInt(value))}
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
            label="السنة"
            className="w-32"
            size="sm"
          />
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="إجمالي الدخل"
          value={data.yearlyTotals.revenue.toLocaleString('ar-EG')}
          subtitle="جنيه مصري"
          icon="BanknotesIcon"
          accentColor="brand"
          delay={0}
        />
        <StatCard
          title="عدد الطلبات"
          value={data.yearlyTotals.ordersCount.toLocaleString('ar-EG')}
          subtitle={`طلب ${data.yearlyTotals.ordersCount === 1 ? '' : 'ات'}`}
          icon="ShoppingBagIcon"
          accentColor="indigo"
          delay={0.1}
        />
        <StatCard
          title="القطع المباعة"
          value={data.yearlyTotals.itemsSold.toLocaleString('ar-EG')}
          subtitle="قطعة hardware"
          icon="CubeIcon"
          accentColor="amber"
          delay={0.2}
        />
      </div>

      {/* Main Chart Section */}
      <motion.div
        variants={itemVariants}
        className="bg-surface-secondary rounded-2xl p-6 border border-border-light border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-body font-bold text-text-primary text-text-primary flex items-center gap-2">
            <Icon name="PresentationChartLineIcon" size={18} className="text-brand-500" />
            رسم بياني للإيرادات والطلبات
          </h3>
          <div className="flex items-center gap-2 p-1 bg-surface-tertiary rounded-lg">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-md text-caption font-medium transition-all ${
                chartType === 'area'
                  ? 'bg-surface-secondary text-brand-500 shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              مساحي
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-md text-caption font-medium transition-all ${
                chartType === 'bar'
                  ? 'bg-surface-secondary text-brand-500 shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              أعمدة
            </button>
          </div>
        </div>

        {/* Recharts Area/Bar Chart */}
        <div className="h-72" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#37D7AC" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#37D7AC" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="الإيرادات"
                  stroke="#37D7AC"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="الربح"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  animationDuration={1500}
                />
              </AreaChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="left"
                  dataKey="الإيرادات"
                  fill="#37D7AC"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="الطلبات"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  animationDuration={1500}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-brand-500" />
            <span className="text-caption text-text-muted text-text-muted">الإيرادات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-indigo-500" />
            <span className="text-caption text-text-muted text-text-muted">صافي الربح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-caption text-text-muted text-text-muted">عدد الطلبات</span>
          </div>
        </div>
      </motion.div>

      {/* Top Selling Items + Monthly Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopSellingItems year={year} />
        </div>

        {/* Monthly Performance Table */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-surface-secondary rounded-2xl border border-border-light border-border overflow-hidden"
        >
          <div className="p-5 border-b border-border-light border-border">
            <h3 className="text-body font-bold text-text-primary text-text-primary flex items-center gap-2">
              <Icon name="CalendarIcon" size={18} className="text-brand-500" />
              الأداء الشهري
            </h3>
          </div>

          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-surface-secondary bg-surface-tertiary/50 text-caption font-semibold text-text-muted text-text-muted">
            <div className="col-span-2">الشهر</div>
            <div className="col-span-2 text-center">الإيرادات</div>
            <div className="col-span-2 text-center">الربح</div>
            <div className="col-span-1 text-center">المباع</div>
            <div className="col-span-1 text-center">الطلبات</div>
            <div className="col-span-4">تقدم الشهر</div>
          </div>

          {/* Monthly Rows */}
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {data.months.map((month, index) => {
              const maxRevenue = Math.max(...data.months.map((m) => m.revenue));
              const progress = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;

              return (
                <motion.div
                  key={month.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-surface-secondary dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${
                    selectedMonth === month.month ? 'bg-surface-tertiary/50' : ''
                  }`}
                  onClick={() => handleMonthClick(month.month)}
                >
                  <div className="col-span-12 lg:col-span-2 flex items-center gap-2">
                    <Icon
                      name={selectedMonth === month.month ? 'ChevronDownIcon' : 'ChevronLeftIcon'}
                      size={16}
                      className="text-text-muted"
                    />
                    <p className="text-body-sm font-semibold text-text-primary text-text-primary">
                      {month.monthName}
                    </p>
                  </div>

                  <div className="hidden lg:block col-span-2 text-center">
                    <p className="text-body-sm font-bold text-brand-600 text-brand-400">
                      {month.revenue.toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <div className="hidden lg:block col-span-2 text-center">
                    <p
                      className={`text-body-sm font-bold ${month.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}
                    >
                      {month.netProfit >= 0 ? '+' : '-'}
                      {Math.abs(month.netProfit).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <div className="col-span-4 lg:col-span-1 text-center">
                    <p className="text-body-sm font-semibold text-text-primary text-text-primary">
                      {month.itemsSold}
                    </p>
                    <p className="text-caption text-text-muted text-text-muted lg:hidden">قطعة</p>
                  </div>

                  <div className="col-span-4 lg:col-span-1 text-center">
                    <p className="text-body-sm font-semibold text-text-primary text-text-primary">
                      {month.ordersCount}
                    </p>
                    <p className="text-caption text-text-muted text-text-muted lg:hidden">طلب</p>
                  </div>

                  <div className="col-span-4 lg:col-span-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-to-l from-brand-500 to-brand-400"
                        />
                      </div>
                      <span className="text-caption text-text-muted text-text-muted w-12 text-left">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Monthly Audit Panel */}
      <AnimatePresence>
        {selectedMonth && auditData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-surface-secondary rounded-2xl border border-border-light border-border overflow-hidden">
              <div className="p-5 border-b border-border-light border-border bg-gradient-to-r from-brand-50 dark:from-brand-500/5 to-transparent">
                <h3 className="text-body font-bold text-text-primary text-text-primary flex items-center gap-2">
                  <Icon name="ClipboardDocumentListIcon" size={18} className="text-brand-500" />
                  الجرد الشهري - {MONTHS_AR[selectedMonth - 1]} {year}
                </h3>
                <p className="text-caption text-text-muted text-text-muted mt-1">
                  ملخص المنتجات المباعة والمخزون المتبقي والأرباح
                </p>
              </div>

              {auditLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                </div>
              ) : auditData?.audit?.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
                    <Icon name="InboxIcon" size={28} className="text-text-muted" />
                  </div>
                  <p className="text-body-sm text-text-muted text-text-muted">
                    لا توجد مبيعات في هذا الشهر
                  </p>
                </div>
              ) : (
                <>
                  {/* Audit Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-border-light border-border bg-surface-secondary/50 bg-surface-tertiary/30">
                    <div className="text-center">
                      <p className="text-caption text-text-muted text-text-muted">
                        المنتجات المباعة
                      </p>
                      <p className="text-h3 font-bold text-text-primary text-text-primary">
                        {auditData?.summary?.totalProductsSold || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-caption text-text-muted text-text-muted">القطع المباعة</p>
                      <p className="text-h3 font-bold text-brand-500">
                        {auditData?.summary?.totalItemsSold || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-caption text-text-muted text-text-muted">
                        إجمالي الإيرادات
                      </p>
                      <p className="text-h3 font-bold text-brand-600 text-brand-400">
                        {(auditData?.summary?.totalRevenue || 0).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-caption text-text-muted text-text-muted">صافي الربح</p>
                      <p
                        className={`text-h3 font-bold ${(auditData?.summary?.totalNetProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}
                      >
                        {(auditData?.summary?.totalNetProfit || 0).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  </div>

                  {/* Audit Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-surface-secondary bg-surface-tertiary/50">
                        <tr className="text-caption font-semibold text-text-muted text-text-muted">
                          <th className="text-right px-4 py-3">المنتج</th>
                          <th className="text-center px-4 py-3">المباع</th>
                          <th className="text-center px-4 py-3">المخزون</th>
                          <th className="text-center px-4 py-3">الإيرادات</th>
                          <th className="text-center px-4 py-3">التكلفة</th>
                          <th className="text-center px-4 py-3">صافي الربح</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light dark:divide-border-dark">
                        {auditData?.audit?.map((item: any, idx: number) => (
                          <motion.tr
                            key={item.productId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="hover:bg-surface-secondary/50 dark:hover:bg-surface-dark-tertiary/30"
                          >
                            <td className="px-4 py-3">
                              <p className="text-body-sm font-semibold text-text-primary text-text-primary">
                                {item.productName}
                              </p>
                              {item.brand && (
                                <p className="text-caption text-text-muted">{item.brand}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-body-sm font-semibold text-brand-500">
                                {item.itemsSold}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`text-body-sm font-semibold ${
                                  item.currentStock > 10
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : item.currentStock > 0
                                      ? 'text-amber-500'
                                      : 'text-rose-500'
                                }`}
                              >
                                {item.currentStock}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-body-sm font-medium text-text-primary text-text-primary">
                                {item.revenue.toLocaleString('ar-EG')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-body-sm font-medium text-rose-500">
                                {item.cost.toLocaleString('ar-EG')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`text-body-sm font-bold ${item.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}
                              >
                                {item.netProfit >= 0 ? '+' : ''}
                                {item.netProfit.toLocaleString('ar-EG')}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
