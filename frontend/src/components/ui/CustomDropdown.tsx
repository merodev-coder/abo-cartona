'use client';

import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CustomDropdown = memo(function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  label,
  error = false,
  errorMessage,
  required = false,
  disabled = false,
  searchable = false,
  clearable = false,
  className = '',
  size = 'md',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchable, searchQuery]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const handleSelect = useCallback(
    (optionValue: string) => {
      const option = options.find((opt) => opt.value === optionValue);
      if (option?.disabled) return;
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    },
    [options, onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
    },
    [onChange]
  );

  const sizeClasses = {
    sm: { trigger: 'px-3 py-2 text-xs', icon: 14, list: 'max-h-48', item: 'px-3 py-2' },
    md: { trigger: 'px-4 py-3.5 text-sm', icon: 18, list: 'max-h-64', item: 'px-4 py-3' },
    lg: { trigger: 'px-5 py-4.5 text-base', icon: 20, list: 'max-h-72', item: 'px-5 py-4' },
  };

  const { trigger, icon: iconSize, list, item } = sizeClasses[size];

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`} dir="rtl">
      {label && (
        <label className="block text-[13px] font-black text-white/70 mb-2.5 mr-1 tracking-wide uppercase">
          {label}
          {required && <span className="text-[#2ab88a] mr-1">*</span>}
        </label>
      )}

      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className={`
          w-full flex items-center justify-between gap-3 rounded-2xl transition-all duration-300 transform-gpu
          ${trigger}
          ${
            disabled
              ? 'cursor-not-allowed opacity-30 bg-white/5 border-transparent'
              : 'cursor-pointer bg-[#131429] hover:bg-white/5 border-white/10 hover:border-[#2ab88a]/30 shadow-2xl'
          }
          ${error ? 'border-red-500/50 ring-4 ring-red-500/10' : 'border'}
        `}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
          {selectedOption?.icon && (
            <Icon
              name={selectedOption.icon}
              size={iconSize}
              className="text-[#2ab88a] flex-shrink-0"
            />
          )}
          <span
            className={`font-bold truncate block max-w-[calc(100%-40px)] ${
              selectedOption ? 'text-white' : 'text-white/40'
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {clearable && value && !disabled && (
            <motion.div
              onClick={handleClear}
              whileHover={{ scale: 1.1 }}
              className="p-1 rounded-full text-white/40 hover:text-red-500 transition-colors"
            >
              <Icon name="XMarkIcon" size={14} />
            </motion.div>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-white/40"
            transition={{ duration: 0.3, ease: 'backOut' }}
          >
            <Icon name="ChevronDownIcon" size={iconSize as 14 | 18 | 20} />
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {error && errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400 mt-2.5 flex items-center gap-1.5 mr-1 font-bold"
          >
            <Icon name="ExclamationCircleIcon" size={14} />
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {isOpen && (
        <div className="absolute z-[70] mt-3 w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-[#131429] backdrop-blur-xl flex flex-col max-h-80 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {searchable && (
            <div className="p-3.5 border-b border-white/5 bg-white/5">
              <div className="relative">
                <Icon
                  name="MagnifyingGlassIcon"
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  placeholder="ابحث هنا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-11 pl-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#2ab88a]/40 transition-all placeholder:text-white/20"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <div className={`${list} overflow-y-auto p-2 custom-scrollbar`}>
            {filteredOptions.length === 0 ? (
              <div className="py-10 text-center">
                <Icon name="InboxIcon" size={24} className="mx-auto mb-2 text-white/20" />
                <p className="text-xs text-white/20 font-bold">لا توجد نتائج</p>
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`
                        w-full text-right flex items-center justify-between gap-3 rounded-xl transition-colors duration-200 mb-1 last:mb-0
                        ${item}
                        ${option.disabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5'}
                        ${value === option.value ? 'bg-[#2ab88a]/10 text-[#2ab88a]' : 'text-white/60 hover:text-white'}
                      `}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && (
                      <div
                        className={`p-1.5 rounded-lg ${value === option.value ? 'bg-[#2ab88a]/10' : 'bg-white/5'}`}
                      >
                        <Icon name={option.icon} size={14} />
                      </div>
                    )}
                    <span className="font-bold tracking-wide">{option.label}</span>
                  </div>
                  {value === option.value && (
                    <div className="flex-shrink-0">
                      <Icon name="CheckIcon" size={16} className="text-[#2ab88a]" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar {
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2ab88a;
        }
      `}</style>
    </div>
  );
});

export default CustomDropdown;
