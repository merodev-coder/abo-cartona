import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomBytes } from 'k6/crypto';
const base = __ENV.BASE_URL;
if (
  !base ||
  __ENV.ALLOW_ISOLATED_LOAD !== 'true' ||
  !__ENV.PRODUCT_ID ||
  !__ENV.PROOF_FILE ||
  !__ENV.PAYMENT_METHOD
)
  throw new Error(
    'Requires isolated backend, seeded product, private test bucket, and a valid proof image. See docs.'
  );
const image = open(__ENV.PROOF_FILE, 'b');
export const options = {
  vus: Number(__ENV.CHECKOUT_VUS || 10),
  duration: '2m',
  thresholds: { http_req_failed: ['rate<0.01'] },
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};
const uuid = () =>
  Array.from(new Uint8Array(randomBytes(20)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
export default function () {
  const token = uuid();
  const proof = http.post(
    `${base}/api/orders/proofs`,
    { proof: http.file(image, 'receipt.png', 'image/png'), paymentMethod: __ENV.PAYMENT_METHOD },
    { headers: { 'X-Checkout-Token': token }, tags: { journey: 'proof_upload' } }
  );
  if (!check(proof, { 'proof saved': (r) => r.status === 201 })) return;
  const pickup = Math.random() < 0.5;
  const payload = JSON.stringify({
    deliveryMethod: pickup ? 'pickup' : 'delivery',
    customerName: 'Isolated Load Test',
    phone: '01000000000',
    customerEmail: 'load@example.invalid',
    address: 'Test address',
    governorate: __ENV.GOVERNORATE,
    selectedShippingMethod: __ENV.SHIPPING_METHOD,
    items: [{ id: __ENV.PRODUCT_ID, quantity: 1, price: Number(__ENV.PRODUCT_PRICE) }],
    proofId: proof.json('proofId'),
  });
  const headers = {
    'Content-Type': 'application/json',
    'X-Checkout-Token': token,
    'Idempotency-Key': uuid(),
  };
  const order = http.post(`${base}/api/orders`, payload, {
    headers,
    tags: { journey: pickup ? 'pickup' : 'delivery' },
  });
  check(order, {
    'pending order saved': (r) =>
      r.status === 201 && r.json('order.depositStatus') === 'PENDING_VERIFICATION',
  });
  const retry = http.post(`${base}/api/orders`, payload, {
    headers,
    tags: { journey: 'idempotent_retry' },
  });
  check(retry, {
    'retry returns same order': (r) =>
      r.status === 200 && r.json('order.orderID') === order.json('order.orderID'),
  });
  sleep(15 + Math.random() * 20);
}
