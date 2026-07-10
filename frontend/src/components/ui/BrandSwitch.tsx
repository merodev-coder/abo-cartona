'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface BrandSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelPosition?: 'left' | 'right';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================================================
// Size Configurations
// ============================================================================

const sizeConfig = {
  sm: {
    switch: 'w-10 h-6',
    thumb: 'w-4 h-4',
    translate: 14, // px
    label: 'text-caption',
  },
  md: {
    switch: 'w-14 h-8',
    thumb: 'w-6 h-6',
    translate: 22, // px
    label: 'text-body-sm',
  },
  lg: {
    switch: 'w-18 h-10',
    thumb: 'w-8 h-8',
    translate: 30, // px
    label: 'text-body',
  },
};

// ============================================================================
// BrandSwitch Component
// ============================================================================

export function BrandSwitch({
  checked,
  onChange,
  label = 'تفعيل الماركة',
  labelPosition = 'right',
  disabled = false,
  size = 'md',
  className = '',
}: BrandSwitchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, disabled, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  const config = sizeConfig[size];

  return (
    <div
      className={`flex items-center gap-3 ${labelPosition === 'left' ? 'flex-row-reverse' : ''} ${className}`}
      dir="rtl"
    >
      {/* Switch Container */}
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        className={`
          ${config.switch}
          relative rounded-full transition-colors duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${checked ? 'bg-brand-500 bg-brand-400' : 'bg-surface-tertiary bg-surface-tertiary'}
          ${isFocused ? 'ring-2 ring-brand-500/30 ring-offset-2 ring-offset-surface dark:ring-offset-surface-dark' : ''}
        `}
      >
        {/* Thumb/Knob */}
        <motion.div
          layout
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
            mass: 1,
          }}
          animate={{
            x: checked ? -config.translate : 0,
          }}
          className={`
            ${config.thumb}
            absolute top-1 right-1
            rounded-full bg-white shadow-md
            flex items-center justify-center
          `}
          style={{ willChange: 'transform' }}
        >
          {/* Status Icon */}
          <motion.div
            initial={false}
            animate={{
              opacity: checked ? 1 : 0,
              scale: checked ? 1 : 0.5,
            }}
            transition={{ duration: 0.15 }}
            className="text-brand-500"
          >
            {/* Checkmark icon */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'}
            >
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.button>

      {/* Label */}
      {label && (
        <span
          className={`
            ${config.label}
            font-medium select-none
            ${
              disabled
                ? 'text-text-muted text-text-muted'
                : checked
                  ? 'text-brand-600 text-brand-400'
                  : 'text-text-secondary text-text-secondary'
            }
          `}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// BrandSwitchGroup Component (for dashboard forms)
// ============================================================================

interface BrandSwitchGroupProps {
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
  brands: string[];
  onBrandsChange: (brands: string[]) => void;
  disabled?: boolean;
}

export function BrandSwitchGroup({
  isActive,
  onActiveChange,
  brands,
  onBrandsChange,
  disabled = false,
}: BrandSwitchGroupProps) {
  const [newBrand, setNewBrand] = useState('');

  const handleAddBrand = useCallback(() => {
    if (newBrand.trim() && !brands.includes(newBrand.trim())) {
      onBrandsChange([...brands, newBrand.trim()]);
      setNewBrand('');
    }
  }, [newBrand, brands, onBrandsChange]);

  const handleRemoveBrand = useCallback(
    (brand: string) => {
      onBrandsChange(brands.filter((b) => b !== brand));
    },
    [brands, onBrandsChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddBrand();
      }
    },
    [handleAddBrand]
  );

  return (
    <div
      className="space-y-4 p-5 rounded-2xl bg-surface-secondary bg-surface-secondary border border-border-light border-border"
      dir="rtl"
    >
      {/* Main Toggle */}
      <BrandSwitch
        checked={isActive}
        onChange={onActiveChange}
        label="تفعيل الماركة"
        disabled={disabled}
        size="lg"
      />

      {/* Description */}
      <p className="text-body-sm text-text-muted text-text-muted">
        عند التفعيل، سيظهر للعملاء قائمة منسدلة لاختيار الماركة المفضلة
      </p>

      {/* Brand Management (only shown when active) */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3 pt-3 border-t border-border-light border-border"
        >
          <label className="text-body-sm font-semibold text-text-primary text-text-primary">
            قائمة الماركات
          </label>

          {/* Add New Brand Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="أضف ماركة جديدة..."
              disabled={disabled}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface bg-surface border border-border-light border-border text-body-sm text-text-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            <motion.button
              type="button"
              onClick={handleAddBrand}
              disabled={disabled || !newBrand.trim()}
              whileHover={!disabled && newBrand.trim() ? { scale: 1.02 } : {}}
              whileTap={!disabled && newBrand.trim() ? { scale: 0.98 } : {}}
              className={`
                px-4 py-2.5 rounded-xl font-semibold text-body-sm
                transition-colors duration-200
                ${
                  disabled || !newBrand.trim()
                    ? 'bg-surface-tertiary bg-surface-tertiary text-text-muted cursor-not-allowed'
                    : 'bg-brand-500 text-white hover:bg-brand-600 bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300'
                }
              `}
            >
              إضافة
            </motion.button>
          </div>

          {/* Brands List */}
          {brands.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <motion.div
                  key={brand}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20"
                >
                  <span className="text-body-sm font-medium text-brand-600 text-brand-400">
                    {brand}
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => handleRemoveBrand(brand)}
                    disabled={disabled}
                    whileHover={!disabled ? { scale: 1.1 } : {}}
                    whileTap={!disabled ? { scale: 0.9 } : {}}
                    className={`
                      p-0.5 rounded-full transition-colors
                      ${
                        disabled
                          ? 'text-text-muted cursor-not-allowed'
                          : 'text-brand-400 hover:text-brand-600 text-brand-400 dark:hover:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-500/20'
                      }
                    `}
                    aria-label={`إزالة ${brand}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M4 4L10 10M10 4L4 10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-caption text-text-muted text-text-muted">
              لا توجد ماركات مضافة بعد. أضف ماركة لتمكين الاختيار.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default BrandSwitch;
