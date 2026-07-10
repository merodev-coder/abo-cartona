import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsapinit';

export function useGSAP() {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    ctx.current = gsap.context(() => {});
    return () => {
      ctx.current?.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);
}

export function useGSAPTimeline(callback: (tl: gsap.core.Timeline) => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    callbackRef.current(tl);
    tl.play();
    return () => {
      tl.kill();
    };
  }, []);
}

export { gsap, ScrollTrigger, SplitText };
