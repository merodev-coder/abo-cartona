import React from 'react';

export default function SectionSeparator() {
  return (
    <div className="relative w-full py-16 md:py-24 overflow-hidden bg-surface dark:bg-black">
      {/* Gradient separator line - more visible */}
      <div className="absolute inset-x-0 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

      {/* Decorative elements - brighter and more visible */}
      <div className="absolute left-1/4 top-1/2 w-3 h-3 -translate-y-1/2 rounded-full bg-brand-400 shadow-[0_0_12px_rgba(55,215,172,0.6)]" />
      <div className="absolute left-2/4 top-1/2 w-4 h-4 -translate-y-1/2 rounded-full bg-brand-500 shadow-[0_0_16px_rgba(55,215,172,0.8)] blur-[1px]" />
      <div className="absolute right-1/4 top-1/2 w-3 h-3 -translate-y-1/2 rounded-full bg-brand-400 shadow-[0_0_12px_rgba(55,215,172,0.6)]" />
    </div>
  );
}
