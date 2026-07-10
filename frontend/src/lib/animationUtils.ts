import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { gsap } from '@/lib/gsapinit';

export function safeAnimation<T extends MotionProps>(
  animationProps: T,
  condition: boolean = true
): T {
  return condition ? animationProps : ({} as T);
}

export function safeGsapAnimation(
  target: gsap.TweenTarget,
  animationProps: gsap.TweenVars,
  condition: boolean = true
): gsap.core.Tween | null {
  if (!condition || !target) return null;
  return gsap.to(target, animationProps);
}

export function validateAnimationData(data: any): boolean {
  return data !== undefined && data !== null && !isNaN(data);
}

export function safeMotionComponent(
  Component: any,
  props: any,
  condition: boolean = true
) {
  if (!condition) {
    const { initial, animate, exit, whileHover, whileTap, variants, ...safeProps } = props;
    return <Component {...safeProps} />;
  }
  return <Component {...props} />;
}

export function createSafeVariants(variants: any, fallback: any = {}) {
  const safeVariants = { ...fallback };
  
  Object.keys(variants).forEach(key => {
    const variant = variants[key];
    if (typeof variant === 'object' && variant !== null) {
      safeVariants[key] = {};
      Object.keys(variant).forEach(prop => {
        const value = variant[prop];
        if (validateAnimationData(value)) {
          safeVariants[key][prop] = value;
        }
      });
    }
  });
  
  return safeVariants;
}
