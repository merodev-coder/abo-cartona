'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

interface SelectOption {
  value: string;
  label: string;
}

interface ThemedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ThemedSelect({
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  label,
  className = '',
  disabled = false,
}: ThemedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
          {label}
        </label>
      )}
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-200 ${
          disabled
            ? 'bg-surface-tertiary bg-surface-tertiary text-text-muted cursor-not-allowed'
            : 'bg-surface-secondary text-text-primary border border-border hover:border-brand-500/50 dark:hover:border-brand-400/50 focus:border-brand-500 dark:focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-400/20'
        }`}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <span
          className={selectedOption ? 'text-text-primary text-text-primary' : 'text-text-muted'}
        >
          {selectedOption?.label || placeholder}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Icon name="ChevronDownIcon" size={16} className="text-text-muted text-text-muted" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[9999] w-full mt-2 py-2 bg-surface-secondary rounded-xl border border-border shadow-elevated overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-right text-body-sm transition-all duration-150 flex items-center justify-between hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary/50 ${
                    value === option.value
                      ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-600 text-brand-400 font-semibold'
                      : 'text-text-secondary text-text-secondary hover:text-text-primary dark:hover:text-text-dark-primary'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ x: 4 }}
                >
                  {option.label}
                  {value === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Icon name="CheckIcon" size={16} className="text-brand-500 text-brand-400" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ThemedMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
}

export function ThemedMultiSelect({
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  label,
  className = '',
}: ThemedMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectedLabels = options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
          {label}
        </label>
      )}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-body-sm font-medium bg-surface-secondary text-text-primary border border-border hover:border-brand-500/50 dark:hover:border-brand-400/50 focus:border-brand-500 dark:focus:border-brand-400 transition-all duration-200"
        whileTap={{ scale: 0.98 }}
      >
        <span
          className={
            selectedLabels.length > 0 ? 'text-text-primary text-text-primary' : 'text-text-muted'
          }
        >
          {selectedLabels.length > 0 ? selectedLabels.join('، ') : placeholder}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Icon name="ChevronDownIcon" size={16} className="text-text-muted text-text-muted" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[9999] w-full mt-2 py-2 bg-surface-secondary rounded-xl border border-border shadow-elevated overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {options.map((option, index) => {
                const isSelected = value.includes(option.value);
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={`w-full px-4 py-2.5 text-right text-body-sm transition-all duration-150 flex items-center justify-between hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary/50 ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-600 text-brand-400 font-semibold'
                        : 'text-text-secondary text-text-secondary hover:text-text-primary dark:hover:text-text-dark-primary'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ x: 4 }}
                  >
                    {option.label}
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                        isSelected
                          ? 'bg-brand-500 border-brand-500'
                          : 'border-border-light border-border'
                      }`}
                    >
                      {isSelected && <Icon name="CheckIcon" size={12} className="text-white" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
