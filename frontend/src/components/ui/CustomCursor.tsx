'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * CustomCursor - A brand-colored cursor dot + ring that follows the mouse.
 * Only visible on non-touch devices.
 */
export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 180, damping: 14, mass: 0.4 });
  const springY = useSpring(cursorY, { stiffness: 180, damping: 14, mass: 0.4 });
  const ringSpringX = useSpring(cursorX, { stiffness: 80, damping: 22 });
  const ringSpringY = useSpring(cursorY, { stiffness: 80, damping: 22 });

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);

    const onEnter = () => setIsVisible(true);
    const onLeave = () => setIsVisible(false);

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHoveringLink(true);
      } else {
        setIsHoveringLink(false);
      }
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', handleHover);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', handleHover);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] pointer-events-none hidden lg:block"
        style={{ cursor: 'none' }}
      >
        {/* Main dot */}
        <motion.div
          className="pointer-events-none fixed top-0 left-0"
          style={{
            x: springX,
            y: springY,
          }}
          animate={{
            scale: isClicking ? 0.5 : isHoveringLink ? 1.4 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div
            className="rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 8,
              height: 8,
              background: '#37D7AC',
              boxShadow: '0 0 10px rgba(55, 215, 172, 0.6)',
            }}
          />
        </motion.div>

        {/* Outer ring */}
        <motion.div
          className="pointer-events-none fixed top-0 left-0"
          style={{
            x: ringSpringX,
            y: ringSpringY,
          }}
          animate={{
            scale: isHoveringLink ? 2.2 : isClicking ? 0.8 : 1,
            opacity: isVisible ? 0.5 : 0,
            borderColor: isHoveringLink ? 'rgba(55, 215, 172, 0.8)' : 'rgba(55, 215, 172, 0.3)',
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          <div
            className="rounded-full -translate-x-1/2 -translate-y-1/2 border-2"
            style={{
              width: 36,
              height: 36,
            }}
          />
        </motion.div>
      </div>
    </>
  );
}
