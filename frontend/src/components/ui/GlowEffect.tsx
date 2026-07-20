'use client';

import { motion } from 'framer-motion';

/**
 * GlowEffect - An ambient teal glow orb that animates subtly.
 * Use as background decoration elements.
 */
export default function GlowEffect({
  size = 300,
  intensity = 0.08,
  className = '',
  position = 'center',
}: {
  size?: number;
  intensity?: number;
  className?: string;
  position?: 'center' | 'right' | 'left' | 'top-right' | 'bottom-left';
}) {
  const posClasses: Record<string, string> = {
    center: 'inset-x-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    right: 'right-0 top-0',
    left: 'left-0 bottom-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  };

  return (
    <div className={`absolute ${posClasses[position]} ${className}`} aria-hidden>
      <motion.div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, rgba(55,215,172,${intensity}) 0%, transparent 65%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
