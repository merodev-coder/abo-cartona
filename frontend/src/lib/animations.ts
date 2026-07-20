/**
 * Shared animation variants and spring configs for consistent motion across the app.
 * All values are tuned for 60fps on mid-range mobile hardware.
 */

import { Variants, Transition, AnimationControls } from 'framer-motion';

// ─── Spring Configs ──────────────────────────────────────────────────────────

export const springStiff = {
  type: 'spring',
  stiffness: 140,
  damping: 18,
  mass: 0.7,
} as const;

export const springSoft = {
  type: 'spring',
  stiffness: 90,
  damping: 22,
  mass: 0.8,
} as const;

export const springBouncy = {
  type: 'spring',
  stiffness: 200,
  damping: 14,
  mass: 0.6,
} as const;

export const springGentle = {
  type: 'spring',
  stiffness: 60,
  damping: 28,
  mass: 1.0,
} as const;

export const materialEase = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94],
} as const;

export const overshootEase = {
  duration: 0.5,
  ease: [0.34, 1.56, 0.64, 1],
} as const;

// ─── Page-Level Variants ─────────────────────────────────────────────────────

export const pageEnter: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// ─── Scroll-Triggered Fade Up ─────────────────────────────────────────────────

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const fadeInUpFast: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...materialEase, duration: 0.45 },
  },
};

// ─── Stagger Containers ──────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─── Card Variants ───────────────────────────────────────────────────────────

export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  hover: (customTilt = 0) => ({
    scale: 1.03,
    y: -8,
    rotateX: customTilt * -2,
    rotateY: customTilt * 3,
    boxShadow: '0 20px 60px -15px rgba(0,0,0,0.5)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  }),
};

// ─── Badge / Pill Pulse ──────────────────────────────────────────────────────

export const badgePulse: Variants = {
  idle: {
    scale: 1,
    opacity: 0.8,
  },
  pulse: {
    scale: [1, 1.06, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── Magnetic Button ─────────────────────────────────────────────────────────

export const magneticTransition: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 15,
  mass: 0.4,
};

// ─── Shimmer / Sweep Glow ────────────────────────────────────────────────────

export const shimmerVariant: Variants = {
  hidden: { x: '-120%', opacity: 0 },
  visible: {
    x: '120%',
    opacity: 1,
    transition: {
      duration: 2.8,
      repeat: Infinity,
      repeatDelay: 1.8,
      ease: 'easeInOut',
    },
  },
};

// ─── Counter / Number Ticker ─────────────────────────────────────────────────

export const counterReveal: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 16,
      mass: 0.8,
    },
  },
};

// ─── CTA Button Entrance ─────────────────────────────────────────────────────

export const ctaEntrance: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springSoft,
      delay: 0.45,
    },
  },
};

// ─── Gradient Text Shift ────────────────────────────────────────────────────

export const gradientShift: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── Scroll Progress Bar ─────────────────────────────────────────────────────

export const progressBarInitial = { scaleX: 0 };
export const progressBarAnimate = {
  scaleX: 1,
  transition: {
    duration: 0.1,
    ease: 'linear',
  },
};

// ─── Image Reveal ────────────────────────────────────────────────────────────

export const imageReveal: Variants = {
  hidden: { scale: 1.2, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─── Globe / Orbit Rotate (continuous) ──────────────────────────────────────

export const continuousRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 30,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ─── Float Animation ─────────────────────────────────────────────────────────

export const floatUpDown: Variants = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── Glow Pulse ──────────────────────────────────────────────────────────────

export const glowPulse: Variants = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.25, 0.55, 0.25],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── Scale Pop (for badges, badges) ─────────────────────────────────────────

export const scalePop: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    y: 6,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 14,
    },
  },
};

// ─── Slide In from Edges ─────────────────────────────────────────────────────

export const slideFromRight: Variants = {
  hidden: { x: 60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { ...springSoft },
  },
};

export const slideFromLeft: Variants = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { ...springSoft },
  },
};

// ─── Viewport configs ────────────────────────────────────────────────────────

export const revealViewport = {
  once: true,
  margin: '-80px',
} as const;

export const revealViewportSensitive = {
  once: true,
  margin: '-40px',
} as const;

export const repeatViewport = {
  once: false,
  margin: '-80px',
} as const;
