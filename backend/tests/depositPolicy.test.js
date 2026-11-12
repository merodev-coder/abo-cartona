import test from 'node:test';
import assert from 'node:assert/strict';
import { pickupAmounts, validateDecision } from '../utils/depositPolicy.js';

test('650 EGP total includes the deposit, leaving 550 EGP', () => {
  assert.deepEqual(pickupAmounts(65000), {
    orderTotalMinor: 65000,
    depositAmountMinor: 10000,
    remainingBalanceMinor: 55000,
  });
});
test('100 EGP minimum leaves no remaining balance', () =>
  assert.equal(pickupAmounts(10000).remainingBalanceMinor, 0));
test('invalid totals and orders below the minimum are rejected', () => {
  for (const value of [0, -100, 9999, NaN, Infinity, 10000.5, '65000'])
    assert.throws(() => pickupAmounts(value), { statusCode: 400 });
});
test('only pending evidence can be reviewed', () => {
  for (const state of ['VERIFIED', 'REJECTED', 'REFUNDED', 'NOT_REQUIRED', 'AWAITING_DEPOSIT'])
    assert.throws(() => validateDecision(state, 'VERIFIED'), { statusCode: 409 });
  assert.doesNotThrow(() => validateDecision('PENDING_VERIFICATION', 'VERIFIED'));
});
test('rejecting a proof requires a bounded explanation', () => {
  for (const reason of [undefined, '', ' ', 'x'.repeat(501)])
    assert.throws(() => validateDecision('PENDING_VERIFICATION', 'REJECTED', reason), {
      statusCode: 400,
    });
  assert.doesNotThrow(() =>
    validateDecision('PENDING_VERIFICATION', 'REJECTED', 'رقم التحويل غير واضح')
  );
});
test('clients cannot invent a verification transition', () => {
  for (const state of ['REFUNDED', 'COMPLETED', 'NOT_REQUIRED', null])
    assert.throws(() => validateDecision('PENDING_VERIFICATION', state), { statusCode: 409 });
});
