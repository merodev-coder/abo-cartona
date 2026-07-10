'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-surface rounded-glass flex items-center justify-center">
        <span className="text-text-muted">لا توجد صور</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Thumbnails - Right side (RTL) */}
      <div className="flex flex-col gap-3 w-20 flex-shrink-0">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              activeIndex === index
                ? 'border-accent shadow-glow-sm'
                : 'border-border hover:border-accent/50'
            }`}
          >
            <Image
              src={image}
              alt={`${productName} - صورة ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div
        className="relative flex-1 aspect-square bg-surface-card rounded-glass overflow-hidden
                   border border-border cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={images[activeIndex]}
          alt={productName}
          fill
          className={`object-contain p-4 transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : undefined
          }
        />

        {/* Zoom Hint */}
        {!isZoomed && (
          <div
            className="absolute bottom-4 left-4 px-3 py-1.5 bg-surface/80 backdrop-blur-sm 
                        rounded-pill text-text-muted text-xs"
          >
            مرر الماوس للتكبير
          </div>
        )}
      </div>
    </div>
  );
}
