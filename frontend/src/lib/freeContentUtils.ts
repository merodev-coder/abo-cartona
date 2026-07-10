/**
 * Utility to check if a product is free digital content (Games, Movies, Apps)
 * These categories are free when purchased with hardware
 */

export const FREE_DIGITAL_SUBTYPES = ['ألعاب', 'أفلام', 'تطبيقات', 'Games', 'Movies', 'Apps'];

export function isFreeDigitalContent(subtype: string | null | undefined): boolean {
  if (!subtype) return false;
  const normalizedSubtype = subtype.trim().toLowerCase();
  return FREE_DIGITAL_SUBTYPES.some((type) => type.toLowerCase() === normalizedSubtype);
}

/**
 * Check if a product should display as "Free with Hardware"
 * Returns true for data type products with specific subtypes
 */
export function isFreeWithHardware(type: string, subtype: string | null | undefined): boolean {
  return type === 'data' && isFreeDigitalContent(subtype);
}
