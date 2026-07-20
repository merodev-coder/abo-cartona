'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  Suspense,
} from 'react';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useStore, type Product } from '@/store/useStore';
import Link from 'next/link';
import LazyProductGrid from '@/components/LazyProductGrid';
import Icon from '@/components/ui/AppIcon';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { getApiUrl } from '@/lib/apiConfig';

// Dynamic import for Footer with loading skeleton
const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => (
    <footer className="h-64 bg-[#080C14]" aria-hidden="true">
      <div className="animate-pulse h-full w-full bg-surface-tertiary/20" />
    </footer>
  ),
  ssr: false,
});

const BRAND_GREEN = '#37D7AC';
const BRAND_GREEN_RGB = '55, 215, 172';
const MAX_ITEMS_PER_SECTION = 8;

/* ────────── Static background (no scroll listeners) ────────── */

const BackgroundMesh = memo(function BackgroundMesh() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
      <div
        className="absolute top-[-12%] left-[-12%] w-[70vw] h-[70vh]"
        style={{
          background: `radial-gradient(circle at center, rgba(${BRAND_GREEN_RGB},0.05) 0%, transparent 58%)`,
        }}
      />
      <div
        className="absolute bottom-[6%] right-[-8%] w-[60vw] h-[60vh]"
        style={{
          background: `radial-gradient(circle at center, rgba(${BRAND_GREEN_RGB},0.035) 0%, transparent 58%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
});

/* ────────── Section divider (static, no infinite animations) ────────── */

const SectionDivider = memo(function SectionDivider() {
  return (
    <div className="relative h-16 sm:h-20 w-full overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute left-1/2 -translate-x-1/2 w-px h-full"
        style={{
          background: `linear-gradient(180deg, transparent, rgba(${BRAND_GREEN_RGB},0.14), transparent)`,
        }}
      />
    </div>
  );
});

/* ────────── Empty section ────────── */

const EnhancedEmptySection = memo(function EnhancedEmptySection({
  message,
  icon = 'ArchiveBoxIcon',
  href = '/products',
  linkLabel = 'تصفح المنتجات',
}: {
  message: string;
  icon?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center section-fade-in">
      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{
          background: `rgba(${BRAND_GREEN_RGB},0.08)`,
          border: `1px solid rgba(${BRAND_GREEN_RGB},0.18)`,
        }}
      >
        <Icon name={icon as any} size={24} style={{ color: BRAND_GREEN, opacity: 0.7 }} />
      </div>
      <p className="text-sm mb-5" style={{ color: 'rgba(148,163,184,0.6)' }}>
        {message}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: `rgba(${BRAND_GREEN_RGB},0.1)`,
          color: BRAND_GREEN,
          border: `1px solid rgba(${BRAND_GREEN_RGB},0.25)`,
        }}
      >
        {linkLabel}
        <ArrowLeft size={14} strokeWidth={2.5} />
      </Link>
    </div>
  );
});

/* ────────── Section header ────────── */

const SectionHeader = memo(function SectionHeader({
  label,
  title,
  accent,
  href,
}: {
  label: string;
  title: string;
  accent: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 lg:mb-16 gap-4 sm:gap-6 section-fade-in">
      <div className="flex items-start gap-5">
        <div
          className="w-1.5 rounded-full flex-shrink-0 mt-3"
          style={{
            height: '72px',
            background: `linear-gradient(180deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN}40 50%, transparent 100%)`,
          }}
        />
        <div className="space-y-3.5">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase px-4 py-1.5 rounded-full"
            style={{
              background: `rgba(${BRAND_GREEN_RGB},0.1)`,
              color: BRAND_GREEN,
              border: `1px solid rgba(${BRAND_GREEN_RGB},0.25)`,
            }}
          >
            <span className="w-[6px] h-[6px] rounded-full" style={{ background: BRAND_GREEN }} />
            {label}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.8rem] font-black text-white tracking-tight leading-[1.12]">
            <span className="block sm:inline">{title} </span>
            <span style={{ color: BRAND_GREEN }}>{accent}</span>
          </h2>
        </div>
      </div>

      {href && (
        <Link
          href={href}
          className="group flex items-center gap-3 text-[13px] font-bold px-6 py-3 rounded-full transition-colors duration-200 hover:bg-white/[0.05]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <span>عرض الكل</span>
          <ArrowLeft
            size={15}
            strokeWidth={2.5}
            className="transition-transform duration-200 group-hover:-translate-x-1"
            style={{ color: BRAND_GREEN }}
          />
        </Link>
      )}
    </div>
  );
});

/* ────────── Section wrapper (no parallax scroll listeners) ────────── */

const SectionWrapper = memo(function SectionWrapper({
  children,
  glowSide = 'center',
  className = '',
  showDivider = true,
  sectionIndex = 0,
}: {
  children: React.ReactNode;
  glowSide?: 'left' | 'right' | 'center';
  className?: string;
  showDivider?: boolean;
  sectionIndex?: number;
}) {
  const glowPosition =
    glowSide === 'left' ? 'left-[-180px]' : glowSide === 'right' ? 'right-[-180px]' : 'left-1/2 -translate-x-1/2';

  return (
    <section className={`relative ${className}`}>
      <div
        className={`pointer-events-none absolute top-0 w-[750px] h-[420px] ${glowPosition}`}
        aria-hidden
        style={{
          background: `radial-gradient(ellipse at ${glowSide === 'left' ? 30 : glowSide === 'right' ? 70 : 50}% 50%, rgba(${BRAND_GREEN_RGB},0.05) 0%, transparent 70%)`,
        }}
      />

      {showDivider && sectionIndex > 0 && (
        <div
          className="w-full h-px mb-14 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${BRAND_GREEN_RGB},0.2), transparent)`,
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </section>
  );
});


/* ────────── Error state ────────── */

const ErrorState = memo(function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{
            background: `rgba(${BRAND_GREEN_RGB},0.08)`,
            border: `1px solid rgba(${BRAND_GREEN_RGB},0.15)`,
          }}
        >
          <Icon name="ExclamationTriangleIcon" size={28} style={{ color: BRAND_GREEN, opacity: 0.7 }} />
        </div>
        <p className="text-slate-400 text-sm mb-5">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-7 py-2.5 rounded-full text-[13px] font-bold transition-transform duration-200 active:scale-95"
          style={{
            background: `rgba(${BRAND_GREEN_RGB},0.12)`,
            color: BRAND_GREEN,
            border: `1px solid rgba(${BRAND_GREEN_RGB},0.25)`,
          }}
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
});

/* ────────── Main Home Page ────────── */

export default function HomePage() {
  const { addToCart } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = getApiUrl('products');

    fetch(apiUrl, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Unable to load products');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart({ ...product, createdAt: '', updatedAt: '' } as Product);
    },
    [addToCart],
  );

  const filteredProducts = useMemo(
    () => ({
      data: products.filter((p) => p.type === 'data').slice(0, MAX_ITEMS_PER_SECTION),
      sales: products.filter((p) => !!p.isSale).slice(0, MAX_ITEMS_PER_SECTION),
      laptops: products.filter((p) => p.type === 'laptops').slice(0, MAX_ITEMS_PER_SECTION),
      accessories: products.filter((p) => p.type === 'accessories').slice(0, MAX_ITEMS_PER_SECTION),
      storage: products.filter((p) => p.type === 'storage').slice(0, MAX_ITEMS_PER_SECTION),
    }),
    [products],
  );

  if (error) return <ErrorState message={error} />;

  return (
    <div
      className="relative min-h-screen selection:bg-[#37D7AC]/25 selection:text-[#37D7AC]"
      dir="rtl"
      style={{ background: '#080C14' }}
    >
      <BackgroundMesh />
      <Header />

      <main className="relative z-10 pt-14 sm:pt-16">
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-24 sm:pb-28 lg:pb-36">
          {loading ? (
            <div className="pt-16 pb-8">
              <ProductGridSkeleton count={8} />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.data.length > 0 ? (
                <>
                  <SectionWrapper glowSide="center" showDivider={false} sectionIndex={0}>
                    <SectionHeader
                      label="Digital Content"
                      title="ألعاب و أفلام و برامج"
                      accent="مجانية مع الهارد"
                      href="/products?cat=data"
                    />
                    <LazyProductGrid items={filteredProducts.data} onAddToCart={handleAddToCart} columns={4} forceLazy={true} eagerCount={2} />
                  </SectionWrapper>
                  <SectionDivider />
                </>
              ) : (
                <SectionWrapper showDivider={false} sectionIndex={0}>
                  <SectionHeader
                    label="Digital Content"
                    title="ألعاب و أفلام و برامج"
                    accent="مجانية مع الهارد"
                  />
                  <EnhancedEmptySection
                    message="لا توجد محتوى رقمي متاح حالياً"
                    href="/products"
                    linkLabel="تصفح جميع المنتجات"
                  />
                </SectionWrapper>
              )}

              {filteredProducts.sales.length > 0 ? (
                <>
                  <SectionWrapper glowSide="center" showDivider sectionIndex={1}>
                    <SectionHeader
                      label="Exclusive Offers"
                      title="عروض"
                      accent="أبو كرتونة"
                      href="/sales"
                    />
                    <LazyProductGrid items={filteredProducts.sales} onAddToCart={handleAddToCart} columns={4} forceLazy={true} eagerCount={2} />
                  </SectionWrapper>
                  <SectionDivider />
                </>
              ) : (
                <SectionWrapper showDivider={false} sectionIndex={1}>
                  <SectionHeader label="Exclusive Offers" title="عروض" accent="أبو كرتونة" />
                  <EnhancedEmptySection
                    message="لا توجد عروض حالياً — تابعنا للمزيد!"
                    icon="TagIcon"
                    href="/products"
                    linkLabel="تصفح المنتجات"
                  />
                </SectionWrapper>
              )}

              <SectionWrapper glowSide="right" showDivider={false} sectionIndex={2}>
                <SectionHeader
                  label="Laptops"
                  title="أحدث"
                  accent="اللابتوبات"
                  href="/products?cat=laptops"
                />
                {filteredProducts.laptops.length > 0 ? (
                  <LazyProductGrid items={filteredProducts.laptops} onAddToCart={handleAddToCart} columns={4} forceLazy={true} eagerCount={2} />
                ) : (
                  <EnhancedEmptySection
                    message="لا توجد لابتوبات متاحة حالياً"
                    icon="ComputerDesktopIcon"
                    href="/products?cat=laptops"
                    linkLabel="تصفح اللابتوبات"
                  />
                )}
              </SectionWrapper>
              <SectionDivider />

              <SectionWrapper glowSide="left" showDivider={false} sectionIndex={3}>
                <SectionHeader
                  label="Accessories"
                  title="إكسسوارات"
                  accent="احترافية"
                  href="/products?cat=accessories"
                />
                {filteredProducts.accessories.length > 0 ? (
                  <LazyProductGrid items={filteredProducts.accessories} onAddToCart={handleAddToCart} columns={4} forceLazy={true} eagerCount={2} />
                ) : (
                  <EnhancedEmptySection
                    message="لا توجد إكسسوارات متاحة حالياً"
                    icon="CpuChipIcon"
                    href="/products?cat=accessories"
                    linkLabel="تصفح الإكسسوارات"
                  />
                )}
              </SectionWrapper>
              <SectionDivider />

              {filteredProducts.storage.length > 0 && (
                <SectionWrapper glowSide="center" showDivider={false} sectionIndex={4}>
                  <SectionHeader
                    label="Storage"
                    title="وحدات"
                    accent="التخزين"
                    href="/products?cat=storage"
                  />
                  <LazyProductGrid
                    items={filteredProducts.storage.slice(0, 4)}
                    onAddToCart={handleAddToCart}
                    columns={4}
                    forceLazy={true}
                    eagerCount={2}
                  />
                </SectionWrapper>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />

      <style>{`
        .section-fade-in {
          animation: sectionFadeIn 0.55s ease-out both;
        }
        .product-grid-item {
          animation: gridItemIn 0.45s ease-out both;
          animation-timeline: view();
          animation-range: entry 0% cover 25%;
        }
        @keyframes sectionFadeIn {
          from { opacity: 0; transform: translate3d(0, 20px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes gridItemIn {
          from { opacity: 0; transform: translate3d(0, 16px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @supports not (animation-timeline: view()) {
          .product-grid-item { animation: none; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .section-fade-in, .product-grid-item { animation: none; }
        }
      `}</style>
    </div>
  );
}
