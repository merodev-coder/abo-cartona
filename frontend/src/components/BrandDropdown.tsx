'use client';

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { createPortal } from 'react-dom';

interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

interface BrandDropdownProps {
  selectedBrand?: string;
  onBrandChange: (brand: string) => void;
  className?: string;
  placeholder?: string;
}

export default function BrandDropdown({
  selectedBrand = '',
  onBrandChange,
  className = '',
  placeholder = 'اختر الماركة...',
}: BrandDropdownProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchBrands = useCallback(async () => {
    setBrandsLoading(true);
    try {
      const response = await fetch('/api/brands', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setBrands(data.filter((b: Brand) => b.isActive !== false));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Calculate position when opening
  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 320;

      // If not enough space below but space above, open upward
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }

      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle click outside and ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const filteredBrands = brands.filter((b: Brand) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBrandData = brands.find((b: Brand) => b.name === selectedBrand);

  const handleSelect = (value: string) => {
    onBrandChange(value);
    setIsOpen(false);
    setSearchQuery('');
  };

  const dropdownStyles: React.CSSProperties = buttonRect
    ? {
        position: 'fixed',
        left: buttonRect.left,
        width: buttonRect.width,
        zIndex: 9999,
        ...(dropdownPosition === 'bottom'
          ? { top: buttonRect.bottom + 12 }
          : { bottom: window.innerHeight - buttonRect.top + 12 }),
      }
    : {};

  return (
    <>
      <div ref={dropdownRef} className={`relative ${className}`} dir="rtl">
        <motion.button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.98 }}
          className={`relative w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-surface-secondary border backdrop-blur-md transition-all duration-300 z-20 ${
            isOpen ? 'border-brand-500 shadow-glow-sm' : 'border-border hover:border-brand-500/30'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <BrandAvatar brand={selectedBrandData} hasSelection={!!selectedBrand} />
            <span
              className={`text-sm truncate ${selectedBrand ? 'text-text-primary font-medium' : 'text-text-muted'}`}
            >
              {selectedBrand || placeholder}
            </span>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <Icon
              name="ChevronDownIcon"
              size={14}
              className={isOpen ? 'text-brand-500' : 'text-text-muted'}
            />
          </motion.div>
        </motion.button>
      </div>

      {isOpen &&
        buttonRect &&
        typeof document !== 'undefined' &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={dropdownStyles}
            className="bg-surface-secondary backdrop-blur-2xl border border-border rounded-2xl shadow-elevated overflow-hidden max-h-[70vh] flex flex-col"
          >
            <div className="p-3 border-b border-border bg-surface-tertiary">
              <div className="relative">
                <Icon
                  name="MagnifyingGlassIcon"
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="ابحث عن الماركة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-9 pl-4 py-2 text-sm rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-y-auto py-2 px-2 custom-scrollbar scroll-smooth">
              {!searchQuery && (
                <DropdownItem
                  label="كل الماركات"
                  isSelected={!selectedBrand}
                  onSelect={() => handleSelect('')}
                  isAll
                />
              )}

              {brandsLoading ? (
                <div className="py-8 text-center">
                  <div className="w-4 h-4 border-2 border-t-brand-500 border-brand-200 dark:border-brand-800 rounded-full animate-spin mx-auto" />
                </div>
              ) : filteredBrands.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted">لا توجد نتائج</div>
              ) : (
                filteredBrands.map((brand) => (
                  <DropdownItem
                    key={brand.id}
                    label={brand.name}
                    isSelected={selectedBrand === brand.name}
                    onSelect={() => handleSelect(brand.name)}
                    avatar={brand.logo}
                  />
                ))
              )}
            </div>
          </motion.div>,
          document.body
        )}
    </>
  );
}

function BrandAvatar({ brand, hasSelection }: { brand?: Brand; hasSelection: boolean }) {
  if (brand?.logo)
    return (
      <img
        src={brand.logo}
        className="w-6 h-6 object-contain rounded-lg bg-surface-tertiary p-0.5"
        alt=""
      />
    );
  return (
    <div
      className={`w-6 h-6 rounded-lg flex items-center justify-center border ${hasSelection ? 'border-brand-500/30 bg-brand-500/10' : 'border-border bg-surface-tertiary'}`}
    >
      <span
        className={`text-[10px] font-bold ${hasSelection ? 'text-brand-500' : 'text-text-muted'}`}
      >
        {brand ? brand.name.charAt(0).toUpperCase() : '?'}
      </span>
    </div>
  );
}

function DropdownItem({
  label,
  isSelected,
  onSelect,
  avatar,
  isAll,
}: {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  avatar?: string;
  isAll?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 mb-1 ${
        isSelected
          ? 'bg-brand-500/15 text-brand-500'
          : 'hover:bg-surface-tertiary text-text-secondary hover:text-text-primary'
      }`}
    >
      {isAll ? (
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? 'bg-brand-500/20' : 'bg-surface-tertiary'}`}
        >
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-1.5 h-1.5 rounded-sm bg-current" />
            <div className="w-1.5 h-1.5 rounded-sm bg-current opacity-50" />
            <div className="w-1.5 h-1.5 rounded-sm bg-current opacity-50" />
            <div className="w-1.5 h-1.5 rounded-sm bg-current" />
          </div>
        </div>
      ) : avatar ? (
        <img
          src={avatar}
          className="w-6 h-6 object-contain rounded-lg bg-surface-tertiary p-0.5"
          alt=""
        />
      ) : (
        <div className="w-6 h-6 rounded-lg bg-surface-tertiary flex items-center justify-center text-[10px] font-bold text-text-muted">
          {label.charAt(0)}
        </div>
      )}
      <span className={`text-sm flex-1 text-right truncate ${isSelected ? 'font-bold' : ''}`}>
        {label}
      </span>
      {isSelected && <Icon name="CheckCircleIcon" size={16} className="text-brand-500" />}
    </button>
  );
}
