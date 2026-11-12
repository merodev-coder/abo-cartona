import test from 'node:test';
import assert from 'node:assert/strict';
import { depositRequirement } from '../utils/depositRequirement.js';
test('800 EGP pickup includes 100 EGP deposit and leaves 700 EGP', () => {
  assert.deepEqual(depositRequirement('pickup', { orderTotalMinor: 80000, shippingMinor: 0 }), { orderTotalMinor: 80000, depositAmountMinor: 10000, remainingBalanceMinor: 70000, depositType: 'STORE_PICKUP_DEPOSIT' });
});
test('800 EGP products and 70 EGP delivery require exactly 70 EGP, leaving 800 EGP', () => {
  assert.deepEqual(depositRequirement('delivery', { orderTotalMinor: 87000, shippingMinor: 7000 }), { orderTotalMinor: 87000, depositAmountMinor: 7000, remainingBalanceMinor: 80000, depositType: 'DELIVERY_FEE_DEPOSIT' });
});
test('delivery fees below 50 EGP are never raised to a hardcoded minimum', () => {
  assert.equal(depositRequirement('delivery', { orderTotalMinor: 82000, shippingMinor: 2000 }).depositAmountMinor, 2000);
});
