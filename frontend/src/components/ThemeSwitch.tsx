'use client';

import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import type { ThemeMode } from '@/types';

const themes: { id: ThemeMode; label: string; color: string }[] = [
  { id: 'normal', label: 'عادي', color: '#37D7AC' },
  { id: 'ramadan', label: 'رمضان', color: '#F59E0B' },
  { id: 'eid', label: 'عيد', color: '#10B981' },
  { id: 'christmas', label: 'كريسماس', color: '#EF4444' },
];

export default function ThemeSwitch() {
  const { storeTheme, setStoreTheme } = useTheme();

  return (
    <div className="p-6 rounded-glass bg-surface border border-border backdrop-blur-glass">
      <h3 className="text-lg font-semibold text-text-primary mb-4">وضع المتجر</h3>

      <div className="relative bg-surface-card rounded-pill p-1 flex">
        {/* Sliding Indicator */}
        <div
          className="absolute top-1 bottom-1 rounded-pill transition-all duration-300 ease-out"
          style={{
            width: '25%',
            left: `${themes.findIndex((t) => t.id === storeTheme) * 25}%`,
            backgroundColor: themes.find((t) => t.id === storeTheme)?.color,
            marginLeft: '4px',
          }}
        />

        {/* Options */}
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setStoreTheme(theme.id)}
            className={`relative z-10 flex-1 py-2 px-3 text-sm font-medium rounded-pill
                       transition-colors duration-200 ${
                         storeTheme === theme.id
                           ? 'text-base'
                           : 'text-text-secondary hover:text-text-primary'
                       }`}
          >
            {theme.label}
          </button>
        ))}
      </div>

      <p className="text-text-muted text-sm mt-4">
        يتغير لون الموقع الرئيسي بناءً على المناسبة المختارة.
      </p>
    </div>
  );
}
