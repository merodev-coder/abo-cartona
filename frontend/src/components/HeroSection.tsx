'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

const BRAND = '#37D7AC'

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] },
  },
}

const springSoft = {
  type: 'spring',
  stiffness: 110,
  damping: 20,
  mass: 0.85,
}

const floatOrb = {
  y: [0, -18, 0],
  transition: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
}

const glowPulse = {
  scale: [1, 1.2, 1],
  opacity: [0.22, 0.48, 0.22],
  transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
}

const arrowAnim = {
  rest: { x: 0 },
  hover: { x: -3 },
}

const badgeShimmer = {
  hidden: { x: '-120%' },
  visible: {
    x: '120%',
    transition: { duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' },
  },
}

const gradientShift = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
  },
}

const categoryHover = {
  rest: { y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } },
  hover: {
    y: -7,
    transition: { type: 'spring', stiffness: 400, damping: 22 },
  },
}

const SparkleSVG = ({
  left,
  top,
  delay,
  duration,
  size,
}: {
  left: string
  top: string
  delay: number
  duration: number
  size: number
}) => (
  <motion.svg
    className="absolute pointer-events-none"
    style={{ left, top, width: size, height: size }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.7, 0.4, 0.8, 0],
      scale: [0, 1, 0.8, 1.1, 0],
      rotate: [0, 90, 180, 270, 360],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    viewBox="0 0 24 24"
    fill="none"
    stroke={BRAND}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
  </motion.svg>
)

const useSparkles = () => {
  return useMemo(
    () => [
      { left: '8%', top: '12%', delay: 0, duration: 4.2, size: 14 },
      { left: '85%', top: '8%', delay: 0.8, duration: 3.8, size: 10 },
      { left: '92%', top: '35%', delay: 1.6, duration: 5.0, size: 12 },
      { left: '6%', top: '55%', delay: 2.2, duration: 4.5, size: 8 },
      { left: '78%', top: '68%', delay: 0.4, duration: 3.6, size: 11 },
      { left: '15%', top: '82%', delay: 1.2, duration: 4.8, size: 9 },
      { left: '50%', top: '5%', delay: 2.8, duration: 5.2, size: 13 },
      { left: '35%', top: '88%', delay: 0.6, duration: 4.0, size: 10 },
      { left: '68%', top: '92%', delay: 1.9, duration: 3.4, size: 7 },
      { left: '25%', top: '25%', delay: 3.1, duration: 4.7, size: 11 },
    ],
    []
  )
}

const categories = [
  {
    id: 'laptops',
    icon: 'Laptop',
    title: 'ترقيات المحمول',
    subtitle: 'حلول متكاملة لأجهزة الـ Laptop',
    href: '/products?cat=laptops',
    badge: 'الأكثر مبيعًا',
  },
  {
    id: 'nvme',
    icon: 'Zap',
    title: 'وحدات NVMe SSD',
    subtitle: 'سرعات نقل تصل إلى 7000MB/s',
    href: '/products?cat=storage',
    badge: null,
  },
  {
    id: 'storage',
    icon: 'HardDrive',
    title: 'وحدات التخزين',
    subtitle: 'سعات ضخمة تصل إلى 4TB',
    href: '/products?cat=storage',
    badge: null,
  },
  {
    id: 'memory',
    icon: 'Cpu',
    title: 'ذاكرة DDR4 / DDR5',
    subtitle: 'سعات تشغيل تصل إلى 64GB',
    href: '/products?cat=accessories',
    badge: null,
  },
]

const iconMap: Record<string, React.ElementType> = {
  Laptop: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 16V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9m16 0H4m16 0l1.28 2.55a1 1 0 01-.9 1.45H3.62a1 1 0 01-.9-1.45L4 16" />
    </svg>
  ),
  Zap: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  HardDrive: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="22" y1="12" x2="2" y2="12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
      <line x1="6" y1="16" x2="6.01" y2="16" />
      <line x1="10" y1="16" x2="10.01" y2="16" />
    </svg>
  ),
  Cpu: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  ),
}

const HeroSection = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const heroRef = useRef<HTMLElement>(null)
  const sparkles = useSparkles()

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.5])
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 28])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const target = hoveredCategory
        ? document.querySelector(`[data-category="${hoveredCategory}"]`) as HTMLElement | null
        : null
      if (!target) return
      const rect = target.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      target.style.setProperty('--mx', `${x}%`)
      target.style.setProperty('--my', `${y}%`)
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [hoveredCategory])

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity: heroOpacity, y: heroY }}
      className="relative min-h-screen overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 48% 38%, rgba(55,215,172,0.055) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 10% 88%, rgba(55,215,172,0.04) 0%, transparent 50%), radial-gradient(ellipse 60% 55% at 88% 10%, rgba(55,215,172,0.03) 0%, transparent 50%), #080C14',
        }}
      />

      <motion.div
        variants={floatOrb}
        animate="animate"
        className="absolute pointer-events-none"
        style={{
          top: '12%',
          right: '14%',
          width: 'clamp(360px, 44vw, 640px)',
          height: 'clamp(360px, 44vw, 640px)',
          borderRadius: '50%',
          background: `radial-gradient(circle at center, ${BRAND}1A 0%, ${BRAND}0A 38%, ${BRAND}04 62%, transparent 80%)`,
          filter: 'blur(80px)',
          willChange: 'transform',
        }}
      />

      <motion.div
        variants={glowPulse}
        animate="animate"
        className="absolute pointer-events-none"
        style={{
          bottom: '14%',
          left: '10%',
          width: 'clamp(280px, 34vw, 520px)',
          height: 'clamp(280px, 34vw, 520px)',
          borderRadius: '50%',
          background: `radial-gradient(circle at center, ${BRAND}18 0%, ${BRAND}0A 42%, transparent 68%)`,
          filter: 'blur(70px)',
          willChange: 'transform',
          animationDelay: '2.5s',
        }}
      />

      <motion.div
        variants={{
          y: [0, -14, 0, 10, 0],
          x: [0, 8, 0, -6, 0],
          transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
        animate="animate"
        className="absolute pointer-events-none"
        style={{
          top: '40%',
          left: '45%',
          width: 'clamp(200px, 28vw, 420px)',
          height: 'clamp(200px, 28vw, 420px)',
          borderRadius: '50%',
          background: `radial-gradient(circle at center, ${BRAND}12 0%, ${BRAND}06 44%, transparent 70%)`,
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.016]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12 pt-24 sm:pt-28 lg:pt-34 pb-10 sm:pb-14">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {sparkles.map((s, i) => (
            <SparkleSVG key={i} {...s} />
          ))}
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center gap-10 lg:gap-12 max-w-4xl mx-auto"
        >


          <motion.div variants={staggerItem} className="space-y-3">
            <h1
              className="text-[clamp(2.2rem,1.3rem+4.2vw,5.2rem)] font-black leading-[1.14] tracking-[-0.025em]"
              style={{
                fontFamily: "'Noto Sans Arabic', 'Readex Pro', -apple-system, sans-serif",
                textRendering: 'optimizeLegibility',
              }}
            >
              <span className="block text-white">فول التجميعة.. واقفل اللعبة!</span>
              <span
                className="block mt-2"
                style={{
                  background: `linear-gradient(130deg, ${BRAND}, #6BFAE0 38%, ${BRAND} 72%)`,
                  backgroundSize: '220% 220%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 7s ease-in-out infinite',
                }}
              >
                طَيَّر الأداء للـ Maximum.. مفيش لاج بعد النهاردة
              </span>
            </h1>
          </motion.div>

          <motion.p
            variants={staggerItem}
            className="text-[clamp(0.92rem,0.82rem+0.55vw,1.15rem)] leading-[1.9] max-w-2xl"
            style={{
              color: 'rgba(203,213,225,0.62)',
              fontFamily: "'Noto Sans Arabic', 'Readex Pro', sans-serif",
            }}
          >
           اختيارك الأول لتطوير جهازك — وحدات تخزين طيارة، رامات عالية الكفاءة للمهام الثقيلة، وأداء مظبوط على الفرازة عشان يخدم المحترفين والجيمرز بصح.
          </motion.p>

          <motion.div variants={staggerItem} className="relative">
            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'clamp(280px, 40vw, 520px)',
                height: 'clamp(100px, 16vh, 180px)',
                borderRadius: '50%',
                background: `radial-gradient(ellipse at center, ${BRAND}30 0%, ${BRAND}18 28%, ${BRAND}0A 55%, transparent 72%)`,
                filter: 'blur(45px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.55, 0.85, 0.55],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full font-bold text-[15px] text-white"
              style={{
                background: `${BRAND}d8`,
                boxShadow: `0 10px 45px ${BRAND}2E, 0 0 0 1px ${BRAND}45 inset`,
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/14">
                  <ShoppingCart size={15} strokeWidth={2.8} />
                </span>
                <span style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
                  تسوق القطع الآن
                </span>
                <motion.span
                  variants={arrowAnim}
                  initial="rest"
                  whileHover="hover"
                  className="inline-flex items-center"
                >
                  <ArrowLeft size={17} strokeWidth={2.5} />
                </motion.span>
              </span>
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(100deg, transparent 22%, rgba(255,255,255,0.12) 50%, transparent 78%)',
                }}
                animate={{ x: ['-115%', '115%'] }}
                transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
              />
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} className="pt-1.5 w-full">
            <div
              className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-7 py-4 rounded-2xl"
              style={{
                background: 'rgba(14,18,28,0.45)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              }}
            >
              {[
                { value: '100%', label: 'قطع أصلية' },
                { value: '24/7', label: 'دعم متواصل' },
                { value: '+5K', label: 'عميل سعيد' },
                { icon: '🌍', label: 'توصيل للمحافظات' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...springSoft, delay: 0.45 + i * 0.07 }}
                  className="flex items-center gap-2"
                >
                  <span
                    className="text-base font-extrabold"
                    style={{ color: 'rgba(203,213,225,0.9)' }}
                  >
                    {item.icon ? item.icon : (
                      <span style={{ color: BRAND }}>{item.value}</span>
                    )}
                  </span>
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: 'rgba(156,163,175,0.75)' }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-20 sm:mt-24 lg:mt-28">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
          >
            {categories.map((cat, i) => {
              const isActive = hoveredCategory === cat.id
              const IconComp = iconMap[cat.icon]
              return (
                <motion.div
                  key={cat.id}
                  variants={staggerItem}
                  custom={i}
                  onHoverStart={() => setHoveredCategory(cat.id)}
                  onHoverEnd={() => setHoveredCategory(null)}
                  className="relative"
                  data-category={cat.id}
                  style={{
                    '--mx': '50%',
                    '--my': '50%',
                  } as React.CSSProperties}
                >
                  <motion.div
                    variants={categoryHover}
                    initial="rest"
                    whileHover="hover"
                    className="relative h-full rounded-3xl overflow-hidden cursor-pointer group"
                    style={{
                      background: isActive
                        ? 'rgba(14,20,32,0.6)'
                        : 'rgba(14,20,32,0.38)',
                      border: '1px solid rgba(255,255,255,0.065)',
                      boxShadow: isActive
                        ? `0 10px 45px rgba(0,0,0,0.38), 0 0 0 1px ${BRAND}18 inset`
                        : '0 4px 22px rgba(0,0,0,0.22)',
                      backdropFilter: 'blur(26px)',
                      WebkitBackdropFilter: 'blur(26px)',
                      transition: 'background 0.38s ease, box-shadow 0.38s ease',
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none"
                      style={{
                        background: isActive
                          ? `radial-gradient(circle at var(--mx) var(--my), ${BRAND}0A 0%, transparent 52%)`
                          : 'none',
                        opacity: isActive ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                      }}
                    />

                    <Link
                      href={cat.href}
                      className="relative z-10 flex flex-col gap-4 p-6 sm:p-7 h-full"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className="flex items-center justify-center w-11 h-11 rounded-2xl transition-colors duration-300"
                          style={{
                            background: isActive ? `${BRAND}18` : `${BRAND}10`,
                            color: BRAND,
                          }}
                        >
                          <IconComp size={22} />
                        </span>
                        {cat.badge && (
                          <span
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                            style={{
                              background: `${BRAND}1E`,
                              color: BRAND,
                              border: `1px solid ${BRAND}38`,
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                            }}
                          >
                            {cat.badge}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-right">
                        <h3
                          className="text-[clamp(1rem,0.9rem+0.5vw,1.22rem)] font-extrabold text-white leading-snug"
                          style={{
                            fontFamily: "'Noto Sans Arabic', 'Readex Pro', sans-serif",
                          }}
                        >
                          {cat.title}
                        </h3>
                        <p
                          className="text-[13px] leading-relaxed"
                          style={{ color: 'rgba(148,163,184,0.68)' }}
                        >
                          {cat.subtitle}
                        </p>
                      </div>

                      <div
                        className="flex items-center justify-end gap-1.5 pt-1 text-[13px] font-bold group/arrow"
                        style={{ color: BRAND }}
                      >
                        <motion.span
                          variants={arrowAnim}
                          initial="rest"
                          whileHover="hover"
                          className="inline-flex items-center"
                        >
                          <ArrowLeft size={13} strokeWidth={2.8} />
                        </motion.span>
                        <motion.span
                          className="group-hover/arrow:translate-x-[-2px] transition-transform duration-180"
                          style={{
                            direction: 'ltr',
                            unicodeBidi: 'bidi-override',
                            fontFamily: "'Noto Sans Arabic', sans-serif",
                          }}
                        >
                          {cat.href.includes('?') ? 'تصفح' : 'اكتشف'}
                        </motion.span>
                      </div>
                    </Link>

                    <div
                      className="absolute bottom-0 inset-x-0 h-[1.5px] pointer-events-none"
                      style={{
                        background: isActive
                          ? `linear-gradient(90deg, transparent, ${BRAND}55, transparent)`
                          : 'transparent',
                        transition: 'background 0.38s ease',
                      }}
                    />
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div variants={staggerItem} className="mt-4">
            <Link
              href="/products"
              className="group relative flex items-center justify-center gap-3 py-[18px] rounded-2xl text-[14px] font-bold transition-all duration-300"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.065)',
                color: BRAND,
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                fontFamily: "'Noto Sans Arabic', sans-serif",
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                كل القطع
              </span>
              <span className="relative z-10 flex items-center gap-[3px]">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-[2px] rounded-full"
                    style={{
                      width: `${22 - i * 4}px`,
                      background: `linear-gradient(90deg, transparent, ${BRAND}${36 - i * 6}, transparent)`,
                      opacity: 0.35 + i * 0.15,
                    }}
                  />
                ))}
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
      `}</style>
    </motion.section>
  )
}

export default HeroSection
