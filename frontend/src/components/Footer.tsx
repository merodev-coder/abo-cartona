'use client';

import React, { memo, useState, useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { motion, useScroll, useTransform } from 'framer-motion';
import TermsOfServiceModal from './TermsOfServiceModal';

const BRAND = '#37D7AC';
const BRAND_RGB = '55, 215, 172';
const BG = '#080C14';

const footerLinks: Record<
  string,
  {
    title: string;
    links: Array<{ label: string; href: string; isTerms?: boolean }>;
  }
> = {
  products: {
    title: 'المنتجات',
    links: [
      { label: 'ألعاب و أفلام', href: '/products?cat=data' },
      { label: 'اللابتوبات', href: '/products?cat=laptops' },
      { label: 'إكسسوارات', href: '/products?cat=accessories' },
      { label: 'وحدات التخزين', href: '/products?cat=storage' },
    ],
  },
  support: {
    title: 'الدعم',
    links: [
      { label: 'تواصل معنا', href: 'https://chat.whatsapp.com/HgwapUpz5sl1m2fBdf3MCS' },
      { label: 'شروط الخدمة', href: '#', isTerms: true },
    ],
  },
};

const socialLinks = [
  {
    icon: faFacebookF,
    href: 'https://web.facebook.com/profile.php?id=100093235875346',
    label: 'Facebook',
  },
  {
    icon: faWhatsapp,
    href: 'https://chat.whatsapp.com/HgwapUpz5sl1m2fBdf3MCS',
    label: 'WhatsApp',
  },
];

const Footer = memo(function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
      style={{ background: BG }}
    >
      {/* ── Ambient background effects ───────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Ambient glow orbs */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: '-8%',
            right: '10%',
            width: 'clamp(300px, 35vw, 500px)',
            height: 'clamp(300px, 35vw, 500px)',
            background: `radial-gradient(circle, rgba(${BRAND_RGB},0.05) 0%, transparent 70%)`,
            filter: 'blur(70px)',
          }}
          animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            bottom: '5%',
            left: '8%',
            width: 'clamp(250px, 30vw, 420px)',
            height: 'clamp(250px, 30vw, 420px)',
            background: `radial-gradient(circle, rgba(${BRAND_RGB},0.04) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{ y: [0, 12, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.02,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top gradient separator */}
        <div className="absolute top-0 left-0 right-0 h-px">
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(${BRAND_RGB},0.2) 30%, rgba(${BRAND_RGB},0.35) 50%, rgba(${BRAND_RGB},0.2) 70%, transparent)`,
            }}
          />
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12 pt-16 pb-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div
                className="p-2 rounded-2xl transition-all duration-300 group-hover:scale-105"
                style={{
                  background: `rgba(${BRAND_RGB},0.08)`,
                  border: `1px solid rgba(${BRAND_RGB},0.15)`,
                }}
              >
                <AppLogo size={36} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-black text-white tracking-tight">
                  أبوكرتونة
                </span>
                <span
                  className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: BRAND }}
                >
                  Premium Hardware
                </span>
              </div>
            </Link>

            <p
              className="text-[13px] leading-[1.85] mb-7 max-w-xs"
              style={{ color: 'rgba(148,163,184,0.65)' }}
            >
              نوفر لك القوة لتصنع مستقبلك — قطع هاردوير أصلية، أسعار تنافسية،
              وتوصيل لجميع المحافظات.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(148,163,184,0.6)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `rgba(${BRAND_RGB},0.3)`;
                    e.currentTarget.style.color = BRAND;
                    e.currentTarget.style.background = `rgba(${BRAND_RGB},0.06)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.color = 'rgba(148,163,184,0.6)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <FontAwesomeIcon icon={s.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:col-span-4 lg:grid-cols-2">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h4
                  className="text-[11px] font-extrabold tracking-[0.2em] uppercase mb-5 pb-3"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    borderBottom: `1px solid rgba(${BRAND_RGB},0.1)`,
                  }}
                >
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.isTerms ? (
                        <button
                          onClick={() => setIsTermsOpen(true)}
                          className="text-[13px] transition-all duration-300 flex items-center gap-2 group"
                          style={{ color: 'rgba(148,163,184,0.7)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = BRAND;
                            e.currentTarget.style.transform = 'translateX(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(148,163,184,0.7)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <span
                            className="w-1 h-1 rounded-full transition-all duration-300 group-hover:w-2 group-hover:rounded-none"
                            style={{ background: BRAND, opacity: 0.5 }}
                          />
                          {link.label}
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[13px] transition-all duration-300 flex items-center gap-2 group"
                          style={{ color: 'rgba(148,163,184,0.7)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = BRAND;
                            e.currentTarget.style.transform = 'translateX(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(148,163,184,0.7)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <span
                            className="w-1 h-1 rounded-full transition-all duration-300 group-hover:w-2 group-hover:rounded-none"
                            style={{ background: BRAND, opacity: 0.5 }}
                          />
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact column */}
          <div className="lg:col-span-4 min-w-0">
            <div
              className="rounded-2xl p-5 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h4
                className="text-[11px] font-extrabold tracking-[0.2em] uppercase mb-5"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                تواصل مباشر
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                    style={{
                      background: `rgba(${BRAND_RGB},0.08)`,
                      border: `1px solid rgba(${BRAND_RGB},0.12)`,
                    }}
                  >
                    <Icon name="PhoneIcon" size={16} style={{ color: BRAND, opacity: 0.8 }} />
                  </div>
                  <span
                    dir="ltr"
                    className="text-[13px] font-medium truncate w-full"
                    style={{ color: 'rgba(203,213,225,0.7)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = 'rgba(203,213,225,0.95)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'rgba(203,213,225,0.7)')
                    }
                  >
                    +20 106 795 7449
                  </span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                    style={{
                      background: `rgba(${BRAND_RGB},0.08)`,
                      border: `1px solid rgba(${BRAND_RGB},0.12)`,
                    }}
                  >
                    <Icon name="EnvelopeIcon" size={16} style={{ color: BRAND, opacity: 0.8 }} />
                  </div>
                  <span
                    className="text-[13px] font-medium truncate w-full"
                    style={{ color: 'rgba(203,213,225,0.7)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = 'rgba(203,213,225,0.95)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'rgba(203,213,225,0.7)')
                    }
                  >
                    info@abocartona.com
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────── */}
        <div
          className="mt-12 pt-7 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p
            className="text-[12px] font-medium"
            style={{ color: 'rgba(148,163,184,0.4)' }}
          >
            {new Date().getFullYear()} <span style={{ color: 'rgba(203,213,225,0.6)' }}>أبوكرتونة</span>.
            {' '}جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: BRAND, opacity: 0.4 }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: 'rgba(148,163,184,0.35)' }}
            >
              Designed by MiroDev
            </span>
          </div>
        </div>
      </div>

      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </footer>
  );
});

export default Footer;
