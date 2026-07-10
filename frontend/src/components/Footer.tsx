'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import TermsOfServiceModal from './TermsOfServiceModal';

const footerLinks: Record<string, { title: string; links: Array<{ label: string; href: string; isTerms?: boolean }> }> = {
  products: {
    title: 'المنتجات',
    links: [
      { label: 'ألعاب و أفلام', href: '/products?cat=data' },
      { label: ' اللابتوبات', href: '/products?cat=laptops' },
      { label: 'إكسسوارات', href: '/products?cat=accessories' },
      { label: 'هارد درايف', href: '/products?cat=storage' },
    ],
  },
  legal: {
    title: 'القانونية',
    links: [
      { label: 'شروط الخدمة', href: '#', isTerms: true },
    ],
  },
};

const socialLinks = [
  {
    icon: faFacebookF,
    href: 'https://web.facebook.com/profile.php?id=100093235875346&mibextid=ZbWKwL&_rdc=1&_rdr#',
    label: 'Facebook',
  },
  { icon: faWhatsapp, href: 'https://chat.whatsapp.com/HgwapUpz5sl1m2fBdf3MCS', label: 'WhatsApp' },
];

const Footer = memo(function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border-light dark:border-border-dark bg-surface dark:bg-surface-dark">
      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <div className="section-container relative z-10 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6 group cursor-default will-change-transform">
              <div className="p-2 bg-surface-secondary dark:bg-surface-dark-secondary rounded-2xl border border-border-light dark:border-border-dark group-hover:border-brand-500/30 transition-colors duration-200">
                <AppLogo size={40} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-black text-2xl tracking-tight text-text-primary dark:text-text-dark-primary">
                  أبوكرتونة
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-500 font-bold">
                  Premium Hardware Hub
                </span>
              </div>
            </div>
            <p className="text-sm text-text-muted dark:text-text-dark-muted leading-relaxed mb-8 max-w-sm">
              نحن لا نبيع مجرد قطع هاردوير، نحن نوفر لك القوة لتصنع مستقبلك. اشترِ الهارد درايف الآن
              واحصل على مكتبة الداتا كاملة مجاناً.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-surface-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark text-text-muted dark:text-text-dark-muted hover:text-brand-500 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all duration-200 will-change-transform hover:scale-105 active:scale-95"
                >
                  <FontAwesomeIcon icon={s.icon} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="lg:col-span-2 lg:mt-2">
              <h4 className="text-text-primary dark:text-text-dark-primary font-bold mb-6 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isTerms ? (
                      <button
                        onClick={() => setIsTermsOpen(true)}
                        className="text-sm text-text-muted dark:text-text-dark-muted hover:text-brand-500 transition-all duration-200 flex items-center group will-change-transform text-right"
                      >
                        <span className="h-[1px] w-0 bg-brand-500 mr-0 group-hover:w-3 group-hover:ml-2 transition-all duration-200" />
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-text-muted dark:text-text-dark-muted hover:text-brand-500 transition-all duration-200 flex items-center group will-change-transform"
                      >
                        <span className="h-[1px] w-0 bg-brand-500 mr-0 group-hover:w-3 group-hover:ml-2 transition-all duration-200" />
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="lg:col-span-4">
            <div className="p-6 rounded-3xl bg-surface-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark">
              <h4 className="text-text-primary dark:text-text-dark-primary font-bold mb-6 text-sm uppercase tracking-wider">
                تواصل مباشر
              </h4>
              <ul className="space-y-5">
                <li className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform duration-200 will-change-transform">
                    <Icon name="PhoneIcon" size={18} />
                  </div>
                  <span
                    dir="ltr"
                    className="text-text-secondary dark:text-text-dark-secondary font-medium"
                  >
                    +20 106 795 7449
                  </span>
                </li>
                <li className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform duration-200 will-change-transform">
                    <Icon name="EnvelopeIcon" size={18} />
                  </div>
                  <span className="text-text-secondary dark:text-text-dark-secondary font-medium">
                    info@abocartona.com
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border-light dark:border-border-dark flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-text-muted dark:text-text-dark-muted font-medium">
            {new Date().getFullYear()}{' '}
            <span className="text-text-secondary dark:text-text-dark-secondary">أبوكرتونة</span>.
            جميع الحقوق محفوظة.
          </p>

          <div className="flex items-center gap-6">
            <span className="text-[10px] text-text-muted dark:text-text-dark-muted font-bold uppercase tracking-[0.2em]">
              Designed by MiroDev
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
