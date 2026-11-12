export const motionTokens = {
  micro: 0.14,
  panel: 0.26,
  spring: { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.8 },
  reveal: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.22 },
  },
};
