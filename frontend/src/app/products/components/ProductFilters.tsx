'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { useStore } from '@/store/useStore';

interface ProductFiltersProps {
  onFiltersChange?: (filters: {
    categories: string[];
    priceRange: [number, number];
    brands: string[];
    inStock: boolean;
  }) => void;
  isOpen: boolean;
  onClose: () => void;
}

const categoryOptions = [
  { id: 'data', label: 'ألعاب و أفلام', icon: 'PlayIcon' },
  { id: 'laptops', label: 'لاب توب', icon: 'ComputerDesktopIcon' },
  { id: 'accessories', label: 'إكسسوارات', icon: 'CpuChipIcon' },
  { id: 'storage', label: 'قطع كمبيوتر', icon: 'WrenchScrewdriverIcon' },
];

const storageOptions = [
  { id: 'hdd', label: 'HDD', icon: 'CircleStackIcon' },
  { id: 'ssd', label: 'SSD', icon: 'BoltIcon' },
];

export default function ProductFilters({ onFiltersChange, isOpen, onClose }: ProductFiltersProps) {
  const { tags, filters, toggleTag, clearTags, fetchTags, setPriceRange, setCategory, setSubtype, availableSubCategories } = useStore();
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([0, 50000]);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    if (filters.tags.length > 0) {
      setSelectedCats(filters.tags);
    }
  }, [filters.tags]);

  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
  }, [filters.priceRange]);

  const toggleCategory = (id: string) => {
    // Only allow one category at a time
    const next = selectedCats.includes(id) ? [] : [id];
    setSelectedCats(next);

    console.log('Toggle category called:', { id, next, currentCategory: filters.category });

    // Update the store category directly - ONLY set category, don't touch tags
    if (next.length > 0) {
      console.log('Setting category to:', next[0]);
      setCategory(next[0] as any);
    } else {
      console.log('Setting category to all');
      setCategory('all');
    }

    // Don't call onFiltersChange with categories as tags - this was causing the issue
    // onFiltersChange({ categories: next, priceRange: localPriceRange, brands: [], inStock: false });
  };

  const clearAll = () => {
    setSelectedCats([]);
    setLocalPriceRange([0, 50000]);
    clearTags();
    setCategory('all');
    setSubtype('');

    // Immediate update for clear all (not debounced)
    setPriceRange([0, 50000]);
    onFiltersChange?.({ categories: [], priceRange: [0, 50000], brands: [], inStock: false });
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newRange: [number, number] =
      type === 'min'
        ? [Math.min(value, localPriceRange[1] - 500), localPriceRange[1]]
        : [localPriceRange[0], Math.max(value, localPriceRange[0] + 500)];

    // Only update local state for immediate UI feedback
    setLocalPriceRange(newRange);

    // Don't trigger API calls here - let the useEffect handle debouncing
  };

  const handleSliderMouseDown = (type: 'min' | 'max') => {
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    // Get the slider track element
    const sliderTrack = document.getElementById('price-slider-track');
    if (!sliderTrack) return;

    const rect = sliderTrack.getBoundingClientRect();
    // Calculate position relative to the slider track, even if mouse is outside
    const percent = Math.max(0, Math.min(1, (rect.right - e.clientX) / rect.width));
    const value = Math.round((percent * 50000) / 500) * 500;

    handlePriceChange(isDragging, value);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Debounced price range update
  useEffect(() => {
    // Skip if local range matches the store range (no changes needed)
    if (
      localPriceRange[0] === filters.priceRange[0] &&
      localPriceRange[1] === filters.priceRange[1]
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log('Debounced price update:', localPriceRange);
      // Update global store and trigger API call
      setPriceRange(localPriceRange);

      // Also trigger onFiltersChange if provided
      onFiltersChange?.({
        categories: selectedCats,
        priceRange: localPriceRange,
        brands: [],
        inStock: false,
      });
    }, 500); // 500ms debounce delay

    // Cleanup timeout if user continues dragging
    return () => clearTimeout(timeoutId);
  }, [localPriceRange, filters.priceRange, setPriceRange, onFiltersChange, selectedCats]);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handlePriceChange]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          hidden md:block md:sticky top-0 md:top-24 h-full md:h-auto
          w-72 md:w-64 z-50 md:z-auto
          glass-dark md:bg-transparent md:backdrop-filter-none md:border-0
          border-r border-white/10
          overflow-y-auto md:overflow-visible
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:rounded-2xl
        `}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-black text-text-primary">الفلاتر</h3>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={clearAll}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-brand-500 hover:text-primary-bright font-bold transition-colors"
              >
                مسح الكل
              </motion.button>
              <button
                onClick={onClose}
                className="md:hidden btn-ghost w-7 h-7 rounded-lg flex items-center justify-center"
              >
                <Icon name="XMarkIcon" size={14} />
              </button>
            </div>
          </div>

          <div className="mb-6 pb-6 border-b border-white/5">
            <h4 className="text-xs font-black text-brand-500 uppercase tracking-wider mb-4">
              الفئات الرئيسية
            </h4>
            <div className="space-y-2.5">
              {categoryOptions.map((cat) => (
                <motion.label
                  key={cat.id}
                  className={`
                    flex items-center gap-3 cursor-pointer group
                    px-3 py-2.5 rounded-xl transition-all duration-200
                    ${
                      filters.category === cat.id || selectedCats.includes(cat.id)
                        ? 'bg-brand-500/10 border border-brand-500/30'
                        : 'bg-surface-secondary/50 border border-transparent hover:bg-surface-secondary hover:border-border'
                    }
                  `}
                  whileHover={{ x: 4 }}
                >
                  <div
                    className={`
                    w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                    ${
                      filters.category === cat.id || selectedCats.includes(cat.id)
                        ? 'bg-brand-500 border-brand-500'
                        : 'border-border-dark bg-transparent group-hover:border-brand-500/50'
                    }
                  `}
                  >
                    {(filters.category === cat.id || selectedCats.includes(cat.id)) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={filters.category === cat.id || selectedCats.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <Icon
                    name={cat.icon as any}
                    size={18}
                    className={`
                      transition-colors duration-200
                      ${
                        filters.category === cat.id || selectedCats.includes(cat.id)
                          ? 'text-brand-500'
                          : 'text-text-muted group-hover:text-brand-500'
                      }
                    `}
                  />
                  <span
                    className={`
                    text-sm font-medium flex-1 transition-colors duration-200
                    ${
                      filters.category === cat.id || selectedCats.includes(cat.id)
                        ? 'text-brand-500'
                        : 'text-text-muted group-hover:text-brand-500'
                    }
                  `}
                  >
                    {cat.label}
                  </span>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Dynamic Sub-Categories / Brands Section */}
          {filters.category !== 'all' && availableSubCategories.length > 0 && (
            <div className="mb-6 pb-6 border-b border-white/5">
              <h4 className="text-xs font-black text-brand-500 uppercase tracking-wider mb-4">
                الماركات
              </h4>
              <div className="space-y-2.5">
                {availableSubCategories.map((sc) => (
                  <motion.label
                    key={sc.id}
                    className={`
                      flex items-center gap-3 cursor-pointer group
                      px-3 py-2.5 rounded-xl transition-all duration-200
                      ${filters.subtype === sc.slug
                        ? 'bg-brand-500/10 border border-brand-500/30'
                        : 'bg-surface-secondary/50 border border-transparent hover:bg-surface-secondary hover:border-border'
                      }
                    `}
                    whileHover={{ x: 4 }}
                  >
                    <div
                      className={`
                        w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                        ${filters.subtype === sc.slug
                          ? 'bg-brand-500 border-brand-500'
                          : 'border-border-dark bg-transparent group-hover:border-brand-500/50'
                        }
                      `}
                    >
                      {filters.subtype === sc.slug && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={filters.subtype === sc.slug}
                      onChange={() => {
                        setSubtype(filters.subtype === sc.slug ? '' : sc.slug);
                      }}
                    />
                    <span
                      className={`
                        text-sm font-medium flex-1 transition-colors duration-200
                        ${filters.subtype === sc.slug
                          ? 'text-brand-500'
                          : 'text-text-muted group-hover:text-brand-500'
                        }
                      `}
                    >
                      {sc.name}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="mb-6 pb-6 border-b border-white/5">
              <h4 className="text-xs font-black text-brand-500 uppercase tracking-wider mb-4">
                الوسوم
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <motion.button
                    key={tag.id}
                    onClick={() => toggleTag(tag.slug)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCats.includes(tag.slug) || filters.tags.includes(tag.slug)
                        ? 'bg-brand-500 text-text-primary'
                        : 'btn-ghost'
                    }`}
                  >
                    {tag.name}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h4 className="text-xs font-black text-brand-500 uppercase tracking-wider mb-4">
              نطاق السعر
            </h4>
            {/* Price Display - Fixed overlap */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">من:</span>
                <span className="text-sm font-bold text-brand-500">
                  {localPriceRange[0].toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-text-muted">جنيه</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">إلى:</span>
                <span className="text-sm font-bold text-brand-500">
                  {localPriceRange[1].toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-text-muted">جنيه</span>
              </div>
            </div>

            {/* Dual Handle Range Slider */}
            <div
              id="price-slider-track"
              className="relative w-full h-2 bg-surface-tertiary rounded-full cursor-pointer select-none"
            >
              {/* Track Background */}
              <div className="absolute inset-0 bg-surface-tertiary rounded-full" />

              {/* Active Range Bar */}
              <div
                className="absolute h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full shadow-sm transition-all duration-300 ease-out"
                style={{
                  right: `${(localPriceRange[0] / 50000) * 100}%`,
                  width: `${((localPriceRange[1] - localPriceRange[0]) / 50000) * 100}%`,
                }}
              />

              {/* Min Handle (Right Side - Controls Low Price) */}
              <div
                className="absolute w-4 h-4 sm:w-5 sm:h-5 bg-surface border-2 border-brand-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 transition-all duration-200 ease-out z-20 hover:shadow-brand-500/25"
                style={{ right: `${(localPriceRange[0] / 50000) * 100}%` }}
                onMouseDown={() => handleSliderMouseDown('min')}
              >
                <div className="absolute inset-0.5 sm:inset-1 bg-brand-500 rounded-full transition-all duration-200" />
              </div>

              {/* Max Handle (Left Side - Controls High Price) */}
              <div
                className="absolute w-4 h-4 sm:w-5 sm:h-5 bg-surface border-2 border-brand-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 transition-all duration-200 ease-out z-20 hover:shadow-brand-500/25"
                style={{ right: `${(localPriceRange[1] / 50000) * 100}%` }}
                onMouseDown={() => handleSliderMouseDown('max')}
              >
                <div className="absolute inset-0.5 sm:inset-1 bg-brand-500 rounded-full transition-all duration-200" />
              </div>
            </div>

            {/* Input Fields - Fixed for mobile */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
              <div>
                <label className="block text-xs text-text-muted mb-1 truncate">الحد الأدنى</label>
                <input
                  type="number"
                  min="0"
                  max={localPriceRange[1] - 500}
                  step="500"
                  value={localPriceRange[0]}
                  onChange={(e) => handlePriceChange('min', parseInt(e.target.value) || 0)}
                  className="w-full px-2 sm:px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all dark:bg-surface-dark-secondary dark:border-border-dark dark:text-text-dark-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1 truncate">الحد الأقصى</label>
                <input
                  type="number"
                  min={localPriceRange[0] + 500}
                  max="50000"
                  step="500"
                  value={localPriceRange[1]}
                  onChange={(e) => handlePriceChange('max', parseInt(e.target.value) || 50000)}
                  className="w-full px-2 sm:px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all dark:bg-surface-dark-secondary dark:border-border-dark dark:text-text-dark-primary"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
