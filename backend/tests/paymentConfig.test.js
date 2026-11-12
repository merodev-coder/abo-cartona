import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentMethods, paymentForProof } from '../utils/paymentConfig.js';

test('owner-confirmed receiving methods use the exact phone and explicit disabling is enforced', () => {
  delete process.env.PAYMENT_VODAFONE_DESTINATION;
  delete process.env.PAYMENT_INSTAPAY_DESTINATION;
  delete process.env.PAYMENT_INSTAPAY_CONFIRMED;
  assert.equal(paymentMethods().length, 2);
  process.env.PAYMENT_INSTAPAY_CONFIRMED = 'false';
  const methods = paymentMethods();
  assert.equal(methods.length, 1);
  assert.equal(methods[0].code, 'VODAFONE_CASH');
  assert.equal(methods[0].destination, '+20 106 795 7449');
  process.env.PAYMENT_INSTAPAY_CONFIRMED = 'true';
  const enabled = paymentMethods();
  assert.equal(enabled.length, 2);
  assert.equal(enabled[1].code, 'INSTAPAY');
  assert.equal(enabled[1].destination, methods[0].destination);
  assert.equal(
    paymentForProof({ paymentMethod: 'VODAFONE_CASH', paymentDestination: methods[0].destination })
      .id,
    'vodafone'
  );
  assert.throws(
    () => paymentForProof({ paymentMethod: 'INSTAPAY', paymentDestination: 'different-account' }),
    { statusCode: 400 }
  );
  assert.throws(() => paymentForProof({ paymentMethod: 'INSTAPAY' }), { statusCode: 400 });
  process.env.PAYMENT_INSTAPAY_CONFIRMED = 'false';
  assert.throws(
    () =>
      paymentForProof({ paymentMethod: 'INSTAPAY', paymentDestination: methods[0].destination }),
    { statusCode: 400 }
  );
});
