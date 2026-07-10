'use client';

import React, { useState, useEffect } from 'react';
import { RelatedCarousel } from './ClientComponents';

interface RelatedCarouselWrapperProps {
  relatedProducts: any[];
}

export default function RelatedCarouselWrapper({ relatedProducts }: RelatedCarouselWrapperProps) {
  const [brandFilter, setBrandFilter] = useState<string>('');

  useEffect(() => {
    // Read brand filter from data attribute
    const dataElement = document.getElementById('brand-filter-data');
    if (dataElement) {
      const filter = dataElement.getAttribute('data-brand-filter') || '';
      setBrandFilter(filter);
    }

    // Set up mutation observer to detect changes
    const observer = new MutationObserver(() => {
      const filter = dataElement?.getAttribute('data-brand-filter') || '';
      setBrandFilter(filter);
    });

    if (dataElement) {
      observer.observe(dataElement, { attributes: true, attributeFilter: ['data-brand-filter'] });
    }

    return () => observer.disconnect();
  }, []);

  return <RelatedCarousel products={relatedProducts} />;
}
