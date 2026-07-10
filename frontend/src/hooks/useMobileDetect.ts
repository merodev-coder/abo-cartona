'use client';

import { useState, useEffect } from 'react';

interface MobileDetectState {
  isMobile: boolean;
  isTablet: boolean;
  isTouchDevice: boolean;
  prefersReducedMotion: boolean;
  isLowPowerDevice: boolean;
}

export function useMobileDetect(): MobileDetectState {
  const [state, setState] = useState<MobileDetectState>({
    isMobile: false,
    isTablet: false,
    isTouchDevice: false,
    prefersReducedMotion: false,
    isLowPowerDevice: false,
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Detect low-power devices (mobile/tablet or reduced motion preference)
      const isLowPowerDevice =
        isMobile ||
        isTablet ||
        prefersReducedMotion ||
        ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4);

      setState({
        isMobile,
        isTablet,
        isTouchDevice,
        prefersReducedMotion,
        isLowPowerDevice,
      });
    };

    // Initial check
    checkDevice();

    // Listen for resize events
    window.addEventListener('resize', checkDevice);

    // Listen for motion preference changes
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addEventListener('change', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      motionMediaQuery.removeEventListener('change', checkDevice);
    };
  }, []);

  return state;
}

// Hook for simplified animations on mobile
export function useSimplifiedAnimation() {
  const { isLowPowerDevice } = useMobileDetect();

  return {
    // Use simpler animations on low-power devices
    springConfig: isLowPowerDevice
      ? { type: 'tween', duration: 0.2 }
      : { type: 'spring', stiffness: 300, damping: 30 },

    // Disable complex transforms on mobile
    hoverEffect: isLowPowerDevice ? { scale: 1 } : { scale: 1.05 },

    // Reduce parallax on mobile
    parallaxIntensity: isLowPowerDevice ? 0.3 : 1,

    // Disable blur effects on low-power devices
    enableBlur: !isLowPowerDevice,

    // Reduce particle counts
    particleCount: isLowPowerDevice ? 10 : 30,
  };
}

export default useMobileDetect;
