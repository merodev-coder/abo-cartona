'use client';

/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import Image, { type ImageProps } from 'next/image';
import { PRODUCT_IMAGE_FALLBACK, resolveProductImageSrc } from '@/lib/productUtils';

interface AppImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  onClick?: () => void;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
  format?: 'webp' | 'avif' | 'auto';
  [key: string]: unknown;
}

const AppImage = memo(function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  onClick,
  fallbackSrc = PRODUCT_IMAGE_FALLBACK,
  loading = 'lazy',
  unoptimized = false,
  format = 'webp',
  ...props
}: AppImageProps) {
  const resolvedFallback = resolveProductImageSrc(fallbackSrc, PRODUCT_IMAGE_FALLBACK);
  const normalizedSrc = resolveProductImageSrc(src, resolvedFallback);

  const [imageSrc, setImageSrc] = useState(normalizedSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(resolveProductImageSrc(src, resolvedFallback));
    setHasError(false);
    setIsLoading(true);
  }, [src, resolvedFallback]);

  const isExternalUrl = useMemo(
    () => typeof imageSrc === 'string' && imageSrc.startsWith('http'),
    [imageSrc]
  );
  const isDataUri = useMemo(
    () => typeof imageSrc === 'string' && imageSrc.startsWith('data:'),
    [imageSrc]
  );
  const resolvedUnoptimized = unoptimized || isExternalUrl || isDataUri;

  // Generate optimized src with format parameter
  const optimizedSrc = useMemo(() => {
    if (isExternalUrl || isDataUri || unoptimized) return imageSrc;

    // For Next.js Image optimization, add format parameter
    const url = new URL(imageSrc, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost');
    if (!url.searchParams.has('format')) {
      url.searchParams.set('format', format);
    }
    return url.pathname + url.search;
  }, [imageSrc, isExternalUrl, isDataUri, unoptimized, format]);

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      event.currentTarget.onerror = null;

      if (!hasError && imageSrc !== resolvedFallback) {
        setImageSrc(resolvedFallback);
        setHasError(true);
      }
      setIsLoading(false);
    },
    [hasError, imageSrc, resolvedFallback]
  );

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const imageClassName = useMemo(() => {
    const classes = [className];
    if (isLoading) classes.push('bg-surface-tertiary animate-pulse');
    if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-200');
    return classes.filter(Boolean).join(' ');
  }, [className, isLoading, onClick]);

  const imageProps = useMemo(() => {
    const baseProps: Omit<ImageProps, 'src' | 'alt'> & { src: string; alt: string } = {
      src: optimizedSrc,
      alt,
      className: imageClassName,
      quality,
      placeholder,
      unoptimized: resolvedUnoptimized,
      onError: handleError,
      onLoad: handleLoad,
      onClick,
    };

    if (priority) {
      baseProps.priority = true;
    } else {
      baseProps.loading = loading;
    }

    if (blurDataURL && placeholder === 'blur') {
      baseProps.blurDataURL = blurDataURL;
    }

    return baseProps;
  }, [
    optimizedSrc,
    alt,
    imageClassName,
    quality,
    placeholder,
    blurDataURL,
    resolvedUnoptimized,
    priority,
    loading,
    handleError,
    handleLoad,
    onClick,
  ]);

  const extraProps = props as Omit<ImageProps, 'src' | 'alt'>;

  if (fill) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <Image
          {...imageProps}
          fill
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          style={{ objectFit: 'cover' }}
          {...extraProps}
        />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 300}
      sizes={sizes}
      {...extraProps}
    />
  );
});

AppImage.displayName = 'AppImage';

export default AppImage;
