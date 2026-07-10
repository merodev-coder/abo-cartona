'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { SalesData } from '@/types';

interface SalesChartProps {
  data: SalesData[];
}

export default function SalesChart({ data }: SalesChartProps) {
  if (!data || data.length === 0) return null;
  return (
    <div className="p-6 rounded-glass bg-surface border border-border backdrop-blur-glass">
      <h3 className="text-lg font-semibold text-text-primary mb-6">مبيعات الأسبوع</h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#37D7AC" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#37D7AC" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 rounded-lg bg-surface border border-border backdrop-blur-glass">
                      <p className="text-text-muted text-sm mb-1">{label}</p>
                      <p className="text-accent font-semibold">
                        {payload[0].value?.toLocaleString()} ج.م
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="sales"
              stroke="#37D7AC"
              strokeWidth={2}
              fill="url(#colorSales)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
