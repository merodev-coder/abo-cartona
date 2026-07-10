'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
} from 'lucide-react';
import type { MetricCard } from '@/types';

interface MetricsGridProps {
  metrics: MetricCard[];
}

const iconMap: Record<string, React.ReactNode> = {
  sales: <DollarSign className="w-6 h-6" />,
  orders: <ShoppingCart className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  revenue: <CreditCard className="w-6 h-6" />,
};

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="p-6 rounded-glass bg-surface border border-border backdrop-blur-glass
                     transition-all duration-300 hover:border-accent/30"
        >
          {/* Icon */}
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-accent/10 text-accent shadow-glow-sm">
              {iconMap[metric.icon] || <DollarSign className="w-6 h-6" />}
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                metric.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {metric.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(metric.change)}%
            </div>
          </div>

          {/* Value & Label */}
          <div>
            <div className="text-3xl font-bold text-text-primary mb-1">{metric.value}</div>
            <div className="text-text-muted text-sm">{metric.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
