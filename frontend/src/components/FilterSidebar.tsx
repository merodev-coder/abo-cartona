'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import type { FilterState } from '@/types';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  maxPrice?: number;
}

const ramOptions = ['4GB', '8GB', '16GB', '32GB', '64GB'];
const storageOptions = ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '1TB HDD', '2TB HDD'];
const brandOptions = ['Intel', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'Gigabyte', 'Samsung', 'Corsair'];

export default function FilterSidebar({
  filters,
  onFiltersChange,
  maxPrice = 50000,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);

  const handlePriceChange = (value: number, index: number) => {
    const newRange: [number, number] =
      index === 0
        ? [Math.min(value, priceRange[1]), priceRange[1]]
        : [priceRange[0], Math.max(value, priceRange[0])];
    setPriceRange(newRange);
    onFiltersChange({ ...filters, priceRange: newRange });
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const clearAll = () => {
    const reset: FilterState = {
      priceRange: [0, maxPrice],
      ram: [],
      storage: [],
      brands: [],
    };
    setPriceRange([0, maxPrice]);
    onFiltersChange(reset);
  };

  const hasActiveFilters =
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice ||
    filters.ram.length > 0 ||
    filters.storage.length > 0 ||
    filters.brands.length > 0;

  const FilterSection = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-text-secondary font-semibold uppercase text-xs tracking-wider">
          الفلاتر
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-accent text-sm hover:underline transition-colors"
          >
            مسح الكل
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="text-text-muted text-xs uppercase tracking-wider">نطاق السعر</h4>
        <div className="space-y-3">
          <div className="relative h-2 bg-surface-card rounded-full">
            <div
              className="absolute h-full bg-accent rounded-full"
              style={{
                left: `${(priceRange[0] / maxPrice) * 100}%`,
                right: `${100 - (priceRange[1] / maxPrice) * 100}%`,
              }}
            />
            {/* Min Handle */}
            <input
              type="range"
              min={0}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
              className="absolute w-full h-full opacity-0 cursor-pointer"
              style={{ zIndex: 2 }}
            />
            {/* Max Handle */}
            <input
              type="range"
              min={0}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
              className="absolute w-full h-full opacity-0 cursor-pointer"
              style={{ zIndex: 2 }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">{priceRange[0].toLocaleString()} ج.م</span>
            <span className="text-text-muted">{priceRange[1].toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      {/* RAM Filter */}
      <div className="space-y-3">
        <h4 className="text-text-muted text-xs uppercase tracking-wider">الذاكرة العشوائية</h4>
        <div className="space-y-2">
          {ramOptions.map((ram) => (
            <label key={ram} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`
                w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center
                ${
                  filters.ram.includes(ram)
                    ? 'bg-accent border-accent'
                    : 'border-border group-hover:border-accent/50'
                }
              `}
              >
                {filters.ram.includes(ram) && (
                  <svg className="w-3 h-3 text-base" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7L5.5 10.5L12 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={filters.ram.includes(ram)}
                onChange={() => toggleArrayFilter('ram', ram)}
                className="sr-only"
              />
              <span
                className={`text-sm transition-colors ${
                  filters.ram.includes(ram) ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {ram}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Storage Filter */}
      <div className="space-y-3">
        <h4 className="text-text-muted text-xs uppercase tracking-wider">التخزين</h4>
        <div className="space-y-2">
          {storageOptions.map((storage) => (
            <label key={storage} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`
                w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center
                ${
                  filters.storage.includes(storage)
                    ? 'bg-accent border-accent'
                    : 'border-border group-hover:border-accent/50'
                }
              `}
              >
                {filters.storage.includes(storage) && (
                  <svg className="w-3 h-3 text-base" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7L5.5 10.5L12 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={filters.storage.includes(storage)}
                onChange={() => toggleArrayFilter('storage', storage)}
                className="sr-only"
              />
              <span
                className={`text-sm transition-colors ${
                  filters.storage.includes(storage) ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {storage}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-3">
        <h4 className="text-text-muted text-xs uppercase tracking-wider">العلامة التجارية</h4>
        <div className="space-y-2">
          {brandOptions.map((brand) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`
                w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center
                ${
                  filters.brands.includes(brand)
                    ? 'bg-accent border-accent'
                    : 'border-border group-hover:border-accent/50'
                }
              `}
              >
                {filters.brands.includes(brand) && (
                  <svg className="w-3 h-3 text-base" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7L5.5 10.5L12 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggleArrayFilter('brands', brand)}
                className="sr-only"
              />
              <span
                className={`text-sm transition-colors ${
                  filters.brands.includes(brand) ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-24 left-4 z-40 p-3 rounded-glass
                   bg-surface border border-border backdrop-blur-glass
                   text-text-secondary hover:text-accent transition-colors"
      >
        <SlidersHorizontal className="w-5 h-5" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[280px] flex-shrink-0">
        <div className="sticky top-24 p-6 rounded-glass bg-surface border border-border backdrop-blur-glass">
          <FilterSection />
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <aside
            className="lg:hidden fixed inset-y-0 right-0 z-50 w-[300px] p-6
                          bg-surface border-l border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-text-primary font-semibold">الفلاتر</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-muted hover:text-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSection />
          </aside>
        </>
      )}
    </>
  );
}
