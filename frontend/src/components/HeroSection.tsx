'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

const BRAND = '#37D7AC';

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
];

const iconMap: Record<string, React.ElementType> = {
  Laptop: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 16V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9m16 0H4m16 0l1.28 2.55a1 1 0 01-.9 1.45H3.62a1 1 0 01-.9-1.45L4 16" />
    </svg>
  ),
  Zap: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  HardDrive: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="22" y1="12" x2="2" y2="12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
      <line x1="6" y1="16" x2="6.01" y2="16" />
      <line x1="10" y1="16" x2="10.01" y2="16" />
    </svg>
  ),
  Cpu: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
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
};

const CategoryCard = memo(function CategoryCard({ cat }: { cat: (typeof categories)[number] }) {
  const [hovered, setHovered] = useState(false);
  const IconComp = iconMap[cat.icon];

  return (
    <div
      className="relative h-full rounded-3xl overflow-hidden group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative h-full rounded-3xl overflow-hidden transition-[transform,box-shadow] duration-300 hover:-translate-y-1"
        style={{
          background: hovered ? 'rgba(14,20,32,0.85)' : 'rgba(14,20,32,0.65)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: hovered
            ? `0 10px 40px rgba(0,0,0,0.35), 0 0 0 1px ${BRAND}18 inset`
            : '0 4px 22px rgba(0,0,0,0.22)',
        }}
      >
        <Link href={cat.href} className="relative z-10 flex flex-col gap-4 p-6 sm:p-7 h-full">
          <div className="flex items-start justify-between gap-3">
            <span
              className="flex items-center justify-center w-11 h-11 rounded-2xl transition-colors duration-300"
              style={{
                background: hovered ? `${BRAND}18` : `${BRAND}10`,
                color: BRAND,
              }}
            >
              <IconComp width={22} height={22} />
            </span>
            {cat.badge && (
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                style={{
                  background: `${BRAND}1E`,
                  color: BRAND,
                  border: `1px solid ${BRAND}38`,
                }}
              >
                {cat.badge}
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-right">
            <h3
              className="text-[clamp(1rem,0.9rem+0.5vw,1.22rem)] font-extrabold text-white leading-snug"
              style={{ fontFamily: "'Noto Sans Arabic', 'Readex Pro', sans-serif" }}
            >
              {cat.title}
            </h3>
            <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(148,163,184,0.68)' }}>
              {cat.subtitle}
            </p>
          </div>

          <div
            className="flex items-center justify-end gap-1.5 pt-1 text-[13px] font-bold"
            style={{ color: BRAND }}
          >
            <ArrowLeft
              size={13}
              strokeWidth={2.8}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            <span style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
              {cat.href.includes('?') ? 'تصفح' : 'اكتشف'}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
});

const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Static gradients — no blur filters, no scroll-linked motion */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 48% 38%, rgba(55,215,172,0.07) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 10% 88%, rgba(55,215,172,0.05) 0%, transparent 50%), radial-gradient(ellipse 60% 55% at 88% 10%, rgba(55,215,172,0.04) 0%, transparent 50%), #080C14',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12 pt-24 sm:pt-28 lg:pt-34 pb-10 sm:pb-14">
        <div className="flex flex-col items-center text-center gap-10 lg:gap-12 max-w-4xl mx-auto hero-fade-in">
          <div className="space-y-3">
            <h1
              className="text-[clamp(2.2rem,1.3rem+4.2vw,5.2rem)] font-black leading-[1.14] tracking-[-0.025em]"
              style={{
                fontFamily: "'Noto Sans Arabic', 'Readex Pro', -apple-system, sans-serif",
                textRendering: 'optimizeLegibility',
              }}
            >
              <span className="block text-white">فول التجميعة.. وقفل اللعبة!</span>
              <span
                className="block mt-2 hero-gradient-text"
                style={{
                  background: `linear-gradient(130deg, ${BRAND}, #6BFAE0 38%, ${BRAND} 72%)`,
                  backgroundSize: '220% 220%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                طَيَّر الأداء للـ Maximum.. مفيش لاج بعد النهاردة
              </span>
            </h1>
          </div>

          <p
            className="text-[clamp(0.92rem,0.82rem+0.55vw,1.15rem)] leading-[1.9] max-w-2xl"
            style={{
              color: 'rgba(203,213,225,0.62)',
              fontFamily: "'Noto Sans Arabic', 'Readex Pro', sans-serif",
            }}
          >
            اختيارك الأول لتطوير جهازك — وحدات تخزين طيارة، رامات عالية الكفاءة للمهام الثقيلة،
            وأداء مظبوط على الفرازة عشان يخدم المحترفين والجيمرز بصح.
          </p>

          <div className="relative">
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full font-bold text-[15px] text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
                <ArrowLeft
                  size={17}
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
              </span>
            </Link>
          </div>

          <div className="pt-1.5 w-full">
            <div
              className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-7 py-4 rounded-2xl"
              style={{
                background: 'rgba(14,18,28,0.88)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              }}
            >
              {[
                { value: '100%', label: 'قطع أصلية' },
                { value: '24/7', label: 'دعم متواصل' },
                { value: '+5K', label: 'عميل سعيد' },
                { icon: '🌍', label: 'توصيل للمحافظات' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="text-base font-extrabold"
                    style={{ color: 'rgba(203,213,225,0.9)' }}
                  >
                    {item.icon ? item.icon : <span style={{ color: BRAND }}>{item.value}</span>}
                  </span>
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: 'rgba(156,163,175,0.75)' }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 sm:mt-24 lg:mt-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/products"
              className="group flex items-center justify-center gap-3 py-[18px] rounded-2xl text-[14px] font-bold transition-colors duration-200 hover:bg-white/[0.03]"
              style={{
                border: '1px solid rgba(255,255,255,0.065)',
                color: BRAND,
                fontFamily: "'Noto Sans Arabic', sans-serif",
              }}
            >
              كل القطع
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .hero-fade-in {
          animation: heroFadeIn 0.7s ease-out both;
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translate3d(0, 24px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .hero-gradient-text {
          animation: gradientShift 10s ease-in-out infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade-in, .hero-gradient-text { animation: none; }
        }
      `}</style>
    </section>
  );
});

export default HeroSection;
