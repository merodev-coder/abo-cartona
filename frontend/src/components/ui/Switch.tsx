'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean;
}

const BRAND_GREEN = '#37D7AC';

export function Switch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  glow = true,
}: SwitchProps) {
  const sizeConfig = {
    sm: { track: 'w-9 h-5', thumb: 'w-3.5 h-3.5', x: 18 },
    md: { track: 'w-12 h-6.5', thumb: 'w-5 h-5', x: 24 },
    lg: { track: 'w-16 h-8.5', thumb: 'w-6.5 h-6.5', x: 32 },
  };

  const current = sizeConfig[size];

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleToggle}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`
        relative inline-flex items-center rounded-full transition-all duration-300
        focus:outline-none border border-glass-border
        ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
        ${current.track}
        ${className}
      `}
      style={{
        backgroundColor: checked ? 'var(--color-brand)' : 'var(--color-surface)',
        boxShadow: checked && glow ? 'var(--glow-teal-sm)' : 'none',
        backdropFilter: 'blur(12px)',
      }}
    >
      <motion.span
        initial={false}
        animate={{
          x: checked ? current.x : 4,
          transition: {
            type: 'spring',
            stiffness: 600,
            damping: 35,
            mass: 0.8,
          },
        }}
        className={`
          relative block rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.3)]
          ${current.thumb}
        `}
        style={{
          backgroundColor: '#FFFFFF',
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="rounded-full"
                style={{
                  width: '30%',
                  height: '30%',
                  backgroundColor: BRAND_GREEN,
                }}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}

export default Switch;
