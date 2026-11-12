'use client';
export function checkoutToken(): string {
  let token = localStorage.getItem('checkout-owner-token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('checkout-owner-token', token);
  }
  return token;
}
export function checkoutKey(payload: string): string {
  const previous = sessionStorage.getItem('checkout-attempt');
  if (previous) {
    const attempt: { payload: string; key: string } = JSON.parse(previous);
    if (attempt.payload === payload) return attempt.key;
  }
  const key = crypto.randomUUID();
  sessionStorage.setItem('checkout-attempt', JSON.stringify({ payload, key }));
  return key;
}
export { formatEGP } from './currency';
