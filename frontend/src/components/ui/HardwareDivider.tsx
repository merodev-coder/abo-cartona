'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, HardDrive, CircuitBoard } from 'lucide-react';

type IconType = 'cpu' | 'zap' | 'harddrive' | 'circuit';

interface HardwareDividerProps {
  icon?: IconType;
  pulseColor?: string;
  lineColor?: string;
  iconColor?: string;
  pulseDuration?: number;
  className?: string;
}

const iconMap = {
  cpu: Cpu,
  zap: Zap,
  harddrive: HardDrive,
  circuit: CircuitBoard,
};

export default function HardwareDivider({
  icon = 'cpu',
  pulseColor = 'var(--color-brand-500)',
  lineColor = 'var(--color-border)',
  iconColor = 'var(--color-brand-500)',
  pulseDuration = 2.5,
  className = '',
}: HardwareDividerProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className={`relative w-full py-8 md:py-12 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Main container */}
      <div className="relative flex items-center justify-center w-full max-w-5xl mx-auto px-4">
        {/* Left line with gradient fade */}
        <div className="flex-1 relative h-[1px]">
          {/* Base line */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to left, ${lineColor}, transparent)`,
            }}
          />
          {/* Data pulse animation - left to center */}
          <motion.div
            className="absolute top-0 left-0 h-full w-20 transform-gpu will-change-transform"
            style={{
              background: `linear-gradient(to right, transparent, ${pulseColor}, transparent)`,
              opacity: 0.6,
            }}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{
              x: ['-100%', 'calc(100% + 200px)'],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              x: {
                duration: pulseDuration,
                repeat: Infinity,
                ease: [0.4, 0, 0.2, 1],
                repeatDelay: 0.5,
              },
              opacity: {
                duration: pulseDuration,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 0.5,
              },
            }}
          />
        </div>

        {/* Center icon container - Circuit board node style */}
        <div className="relative mx-4 md:mx-6 flex-shrink-0">
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full transform-gpu"
            style={{
              background: `radial-gradient(circle, ${pulseColor}20 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Icon background - hexagonal/circuit style */}
          <div
            className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: lineColor,
              boxShadow: `0 0 20px ${pulseColor}15, inset 0 1px 0 ${pulseColor}10`,
            }}
          >
            {/* Corner accents - circuit board aesthetic */}
            <div
              className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full transform-gpu"
              style={{ backgroundColor: pulseColor }}
            />
            <div
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full transform-gpu"
              style={{ backgroundColor: pulseColor }}
            />
            <div
              className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full transform-gpu"
              style={{ backgroundColor: pulseColor }}
            />
            <div
              className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full transform-gpu"
              style={{ backgroundColor: pulseColor }}
            />

            {/* Icon */}
            <Icon
              size={20}
              strokeWidth={1.5}
              className="transform-gpu"
              style={{ color: iconColor }}
            />
          </div>

          {/* Signal pulse from icon */}
          <motion.div
            className="absolute inset-0 rounded-xl border transform-gpu will-change-transform pointer-events-none"
            style={{ borderColor: pulseColor }}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: [1, 1.4, 1.6], opacity: [0.8, 0.3, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
              repeatDelay: 0.5,
            }}
          />
        </div>

        {/* Right line with gradient fade */}
        <div className="flex-1 relative h-[1px]">
          {/* Base line */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${lineColor}, transparent)`,
            }}
          />
          {/* Data pulse animation - center to right */}
          <motion.div
            className="absolute top-0 left-0 h-full w-20 transform-gpu will-change-transform"
            style={{
              background: `linear-gradient(to right, transparent, ${pulseColor}, transparent)`,
              opacity: 0.6,
            }}
            initial={{ x: '100%', opacity: 0 }}
            animate={{
              x: ['-200px', 'calc(100% + 100%)'],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              x: {
                duration: pulseDuration,
                repeat: Infinity,
                ease: [0.4, 0, 0.2, 1],
                repeatDelay: 0.5,
                delay: pulseDuration * 0.4,
              },
              opacity: {
                duration: pulseDuration,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 0.5,
                delay: pulseDuration * 0.4,
              },
            }}
          />
        </div>
      </div>

      {/* Circuit board trace lines - subtle decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {/* Vertical trace lines */}
        <motion.div
          className="absolute left-1/4 top-0 w-[1px] h-4 bg-gradient-to-b transform-gpu"
          style={{ background: `linear-gradient(to bottom, ${pulseColor}, transparent)` }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
        />
        <motion.div
          className="absolute right-1/4 top-0 w-[1px] h-4 bg-gradient-to-b transform-gpu"
          style={{ background: `linear-gradient(to bottom, ${pulseColor}, transparent)` }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
      </div>
    </div>
  );
}
