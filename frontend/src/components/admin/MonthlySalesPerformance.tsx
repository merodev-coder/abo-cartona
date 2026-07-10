'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { getAdminApiUrl } from '@/lib/apiConfig';
import CustomDropdown from '@/components/ui/CustomDropdown';

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

export default function MonthlySalesPerformance() {
  const [data, setData] = useState<YearlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);

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

        const res = await fetch(`/api/admin/monthly-audit?year=${year}&month=${month}`, {
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

  // Calculate max values for chart scaling
  const maxRevenue = data?.yearlyTotals.revenue || 1;
  const maxProfit = Math.max(...(data?.months.map((m) => Math.abs(m.netProfit)) || [1]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-h3 text-text-primary text-text-primary flex items-center gap-2">
            <Icon name="ChartBarIcon" size={24} className="text-brand-500" />
            تحليل المبيعات والأداء الشهري
          </h2>
          <p className="text-body-sm text-text-muted text-text-muted mt-1">
            متابعة الأداء الشهري للمخزون والأرباح
          </p>
        </div>

        <CustomDropdown
          value={String(year)}
          onChange={(value) => setYear(parseInt(value))}
          options={years.map((y) => ({ value: String(y), label: String(y) }))}
          label="السنة"
          className="w-32"
          size="sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : !data || data.months.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 px-4 bg-surface-secondary rounded-2xl border border-border-light border-border"
        >
          <div className="w-24 h-24 rounded-3xl bg-surface-tertiary flex items-center justify-center mb-6">
            <Icon name="ChartBarIcon" size={40} className="text-text-muted text-text-muted" />
          </div>
          <h3 className="text-h3 text-text-primary text-text-primary mb-2">لا توجد بيانات</h3>
          <p className="text-body-sm text-text-muted text-text-muted text-center max-w-md">
            لا توجد بيانات مبيعات لسنة {year}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Yearly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-secondary rounded-xl p-5 border border-border-light border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-caption text-text-muted text-text-muted">إجمالي الإيرادات</p>
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/10 flex items-center justify-center">
                  <Icon name="BanknotesIcon" size={20} className="text-brand-600 text-brand-400" />
                </div>
              </div>
              <p className="text-h2 font-bold text-brand-600 text-brand-400">
                {data.yearlyTotals.revenue.toLocaleString('ar-EG')}
              </p>
              <p className="text-caption text-text-muted text-text-muted mt-1">جنيه</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-secondary rounded-xl p-5 border border-border-light border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-caption text-text-muted text-text-muted">صافي الربح</p>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.yearlyTotals.netProfit >= 0 ? 'bg-brand-100 dark:bg-brand-500/10' : 'bg-rose-100 dark:bg-rose-500/10'}`}
                >
                  <Icon
                    name="TrendingUpIcon"
                    size={20}
                    className={
                      data.yearlyTotals.netProfit >= 0
                        ? 'text-brand-600 text-brand-400'
                        : 'text-rose-500 dark:text-rose-400'
                    }
                  />
                </div>
              </div>
              <p
                className={`text-h2 font-bold ${data.yearlyTotals.netProfit >= 0 ? 'text-brand-600 text-brand-400' : 'text-rose-500 dark:text-rose-400'}`}
              >
                {data.yearlyTotals.netProfit >= 0 ? '+ ' : '- '}
                {Math.abs(data.yearlyTotals.netProfit).toLocaleString('ar-EG')}
              </p>
              <p className="text-caption text-text-muted text-text-muted mt-1">جنيه</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-secondary rounded-xl p-5 border border-border-light border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-caption text-text-muted text-text-muted">إجمالي الطلبات</p>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                  <Icon
                    name="ShoppingBagIcon"
                    size={20}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
              </div>
              <p className="text-h2 font-bold text-indigo-600 dark:text-indigo-400">
                {data.yearlyTotals.ordersCount.toLocaleString('ar-EG')}
              </p>
              <p className="text-caption text-text-muted text-text-muted mt-1">طلب</p>
            </motion.div>
          </div>

          {/* Monthly Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-secondary rounded-2xl border border-border-light border-border overflow-hidden"
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
              <div className="col-span-2 text-center">التكلفة</div>
              <div className="col-span-2 text-center">صافي الربح</div>
              <div className="col-span-1 text-center">المباع</div>
              <div className="col-span-1 text-center">الطلبات</div>
              <div className="col-span-2">الأداء</div>
            </div>

            {/* Monthly Rows */}
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {data.months.map((month, index) => (
                <motion.div
                  key={month.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-surface-secondary dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${
                    selectedMonth === month.month
                      ? 'bg-surface-secondary bg-surface-tertiary/50'
                      : ''
                  }`}
                  onClick={() => handleMonthClick(month.month)}
                >
                  <div className="col-span-12 lg:col-span-2 flex items-center gap-2">
                    <Icon
                      name={selectedMonth === month.month ? 'ChevronDownIcon' : 'ChevronLeftIcon'}
                      size={16}
                      className="text-text-muted lg:hidden"
                    />
                    <p className="text-body-sm font-semibold text-text-primary text-text-primary">
                      {month.monthName}
                    </p>
                    <p className="text-caption text-text-muted text-text-muted lg:hidden">
                      {month.revenue.toLocaleString('ar-EG')} جنيه
                    </p>
                    <Icon
                      name={selectedMonth === month.month ? 'ChevronDownIcon' : 'ChevronLeftIcon'}
                      size={16}
                      className="text-text-muted hidden lg:block"
                    />
                  </div>

                  <div className="hidden lg:block col-span-2 text-center">
                    <p className="text-body-sm font-bold text-brand-600 text-brand-400">
                      {month.revenue.toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <div className="hidden lg:block col-span-2 text-center">
                    <p className="text-body-sm font-bold text-rose-500 dark:text-rose-400">
                      {(month.productCost + month.operationalCost).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <div className="hidden lg:block col-span-2 text-center">
                    <p
                      className={`text-body-sm font-bold ${month.netProfit >= 0 ? 'text-brand-600 text-brand-400' : 'text-rose-500 dark:text-rose-400'}`}
                    >
                      {month.netProfit >= 0 ? '+' : '-'}
                      {Math.abs(month.netProfit).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <div className="col-span-6 lg:col-span-1 text-center">
                    <p className="text-body-sm font-semibold text-text-primary text-text-primary">
                      {month.itemsSold}
                    </p>
                    <p className="text-caption text-text-muted text-text-muted">قطعة</p>
                  </div>

                  <div className="col-span-6 lg:col-span-1 text-center">
                    <p className="text-body-sm font-semibold text-text-primary text-text-primary">
                      {month.ordersCount}
                    </p>
                    <p className="text-caption text-text-muted text-text-muted">طلب</p>
                  </div>

                  <div className="col-span-12 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-tertiary bg-surface-tertiary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min((month.revenue / maxRevenue) * 100, 100)}%`,
                          }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400"
                        />
                      </div>
                      <span className="text-caption text-text-muted text-text-muted w-12 text-left">
                        {Math.round((month.revenue / maxRevenue) * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Monthly Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface-secondary rounded-2xl p-6 border border-border-light border-border"
          >
            <h3 className="text-body font-bold text-text-primary text-text-primary mb-6 flex items-center gap-2">
              <Icon name="PresentationChartLineIcon" size={18} className="text-brand-500" />
              رسم بياني للإيرادات والأرباح
            </h3>

            <div className="h-64 relative">
              {/* Y-axis grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border-t border-border-light border-border"
                    style={{ opacity: 0.5 }}
                  />
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-around px-2">
                {data.months.map((month, index) => {
                  const revenueHeight = Math.max((month.revenue / maxRevenue) * 100, 5);
                  const profitHeight =
                    month.netProfit >= 0 ? Math.max((month.netProfit / maxRevenue) * 100, 3) : 0;

                  return (
                    <div key={month.month} className="flex flex-col items-center gap-2 flex-1 mx-1">
                      <div className="relative w-full flex items-end justify-center gap-1 h-48">
                        {/* Revenue Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${revenueHeight}%` }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                          className="w-3 sm:w-4 rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-400"
                        />
                        {/* Profit Bar */}
                        {month.netProfit > 0 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${profitHeight}%` }}
                            transition={{ delay: index * 0.05 + 0.1, duration: 0.5 }}
                            className="w-3 sm:w-4 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400"
                          />
                        )}
                      </div>
                      <span className="text-caption text-text-muted text-text-muted text-center">
                        {month.monthName.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-t from-brand-500 to-brand-400" />
                <span className="text-caption text-text-muted text-text-muted">الإيرادات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-600 to-emerald-400" />
                <span className="text-caption text-text-muted text-text-muted">صافي الربح</span>
              </div>
            </div>
          </motion.div>

          {/* Monthly Audit Table - الجرد الشهري */}
          <AnimatePresence>
            {selectedMonth && auditData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white bg-surface-secondary rounded-2xl border border-border-light border-border overflow-hidden">
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
                      <div className="w-16 h-16 rounded-2xl bg-surface-secondary bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
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
                          <p className="text-caption text-text-muted text-text-muted">
                            القطع المباعة
                          </p>
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
                            className={`text-h3 font-bold ${(auditData?.summary?.totalNetProfit || 0) >= 0 ? 'text-brand-600 text-brand-400' : 'text-rose-500 dark:text-rose-400'}`}
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
                                        ? 'text-brand-600 text-brand-400'
                                        : item.currentStock > 0
                                          ? 'text-warning-dark dark:text-warning'
                                          : 'text-rose-500 dark:text-rose-400'
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
                                  <span className="text-body-sm font-medium text-rose-500 dark:text-rose-400">
                                    {item.cost.toLocaleString('ar-EG')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`text-body-sm font-bold ${
                                      item.netProfit >= 0
                                        ? 'text-brand-600 text-brand-400'
                                        : 'text-rose-500 dark:text-rose-400'
                                    }`}
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
        </>
      )}
    </div>
  );
}
