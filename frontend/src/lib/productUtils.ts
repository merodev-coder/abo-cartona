import type { Product } from '@/store/useStore';

/** Lightweight inline SVG used when product images are missing or fail to load. */
export const PRODUCT_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Crect x='140' y='95' width='120' height='90' rx='8' fill='%23d1d5db'/%3E%3Ccircle cx='170' cy='125' r='10' fill='%23e5e7eb'/%3E%3Cpath d='M150 175l30-35 25 25 35-45 40 55H150z' fill='%23e5e7eb'/%3E%3C/svg%3E";

const INVALID_IMAGE_PATHS = new Set(['/placeholder.png', '/assets/images/no_image.png']);

type ProductLinkSource = Pick<Product, 'slug' | 'id' | '_id'> | {
  slug?: string;
  id?: string;
  _id?: string;
};

export function getProductHref(product: ProductLinkSource): string {
  const identifier = product.slug || product.id || product._id;
  return identifier ? `/product/${identifier}` : '/products';
}

export function resolveProductImageSrc(
  src?: string | null,
  fallback: string = PRODUCT_IMAGE_FALLBACK
): string {
  if (!src || INVALID_IMAGE_PATHS.has(src)) {
    return fallback;
  }
  return src;
}
