const egpNumber = new Intl.NumberFormat('ar-EG', {
  numberingSystem: 'latn',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatEGPNumber = (value: number): string =>
  Number.isFinite(value) ? egpNumber.format(value) : '—';

export const formatEGP = (value: number): string => `${formatEGPNumber(value)} ج.م`;
