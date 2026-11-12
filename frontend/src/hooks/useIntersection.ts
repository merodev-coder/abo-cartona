'use client';

import { useEffect, useState, type RefObject } from 'react';

interface UseIntersectionOptions extends IntersectionObserverInit {
  /** Disconnect after first intersection (default: true) */
  once?: boolean;
  /** Skip observation entirely */
  disabled?: boolean;
}

export function useIntersection(
  ref: RefObject<Element | null>,
  {
    once = true,
    disabled = false,
    root = null,
    rootMargin = '200px 0px',
    threshold = 0,
  }: UseIntersectionOptions = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setIsIntersecting(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsIntersecting(false);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, disabled, root, rootMargin, threshold]);

  return isIntersecting;
}
