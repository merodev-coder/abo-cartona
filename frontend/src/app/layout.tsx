import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Readex_Pro, Noto_Sans_Arabic } from 'next/font/google';
import '../styles/globals.css';
import Providers from './providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import SmoothScrollWrapper from '@/components/SmoothScrollWrapper';

const readexPro = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-readex',
  display: 'swap',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080C14',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://abocartona.com'),
  title: {
    default: 'أبو كرتونة | Abu Kartona - متجر الهاردوير في مصر',
    template: '%s | أبو كرتونة'
  },
  description: 'أبو كرتونة - متجر متخصص في قطع الكمبيوتر والهاردوير بأفضل الأسعار في مصر. لابتوبات، SSD، HDD، رامات، إكسسوارات gaming. توصيل لجميع المحافظات.',
  keywords: ['أبو كرتونة', 'Abu Kartona', 'هاردوير مصر', 'كمبيوتر جيمينج', 'SSD', 'RAM', 'بكجات تخزين', 'PC Hardware Egypt', 'Gaming PCs', 'Hardware Store Egypt', 'Laptop Egypt', 'أبو كرتونة', 'متجر هاردوير', 'قطاعات كمبيوتر'],
  authors: [{ name: 'Abu Kartona' }],
  creator: 'Abu Kartona',
  publisher: 'Abu Kartona',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://abocartona.com',
    title: 'أبو كرتونة | متجر الهاردوير والكمبيوتر في مصر',
    description: 'أفضل متجر لقطع الكمبيوتر والهاردوير في مصر. لابتوبات، SSD، هارد درايف، رامات. توصيل لجميع المحافظات.',
    siteName: 'أبو كرتونة',
    images: [{
      url: 'https://abocartona.com/assets/images/app_logo.png',
      width: 1200,
      height: 630,
      alt: 'أبو كرتونة - متجر الهاردوير والكمبيوتر في مصر',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'أبو كرتونة | متجر الهاردوير والكمبيوتر في مصر',
    description: 'أفضل متجر لقطع الكمبيوتر والهاردوير في مصر.',
    images: ['https://abocartona.com/assets/images/app_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
  },
  icons: {
    icon: [{ url: '/assets/images/app_logo.png', type: 'image/png', sizes: 'any' }],
    shortcut: '/assets/images/app_logo.png',
    apple: '/assets/images/app_logo.png',
  },
  alternates: {
    canonical: 'https://abocartona.com',
    languages: {
      'ar': 'https://abocartona.com',
      'en': 'https://abocartona.com',
    },
  },
  category: 'electronics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={`${readexPro.variable} ${notoSansArabic.variable} font-['Noto_Sans_Arabic'] bg-base text-text-primary antialiased`}
      >
        <ThemeProvider>
          <SmoothScrollWrapper>
            <Providers>{children}</Providers>
          </SmoothScrollWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
