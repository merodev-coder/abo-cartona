import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
const reads = new Trend('ordinary_read_duration', true);
const failures = new Rate('journey_failures');
const base = __ENV.BASE_URL;
if (!base || __ENV.ALLOW_ISOLATED_LOAD !== 'true')
  throw new Error(
    'Set BASE_URL to an isolated test backend and ALLOW_ISOLATED_LOAD=true. Never target production.'
  );
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '3m', target: 500 },
    { duration: '3m', target: 1000 },
    { duration: '5m', target: 1000 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    ordinary_read_duration: ['p(95)<500'],
    journey_failures: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
  },
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};
export default function () {
  const response = http.get(`${base}/api/products`, { tags: { journey: 'browse' } });
  reads.add(response.timings.duration);
  failures.add(!check(response, { 'product listing succeeds': (r) => r.status === 200 }));
  sleep(3 + Math.random() * 5);
  const products = response.json('products') || [];
  if (products.length && Math.random() < 0.65) {
    const product = products[Math.floor(Math.random() * products.length)];
    const detail = http.get(`${base}/api/products/${product._id || product.id}`, {
      tags: { journey: 'detail' },
    });
    reads.add(detail.timings.duration);
    failures.add(detail.status !== 200);
  }
  if (Math.random() < 0.2) {
    const search = http.get(`${base}/api/products?search=SSD`, { tags: { journey: 'search' } });
    reads.add(search.timings.duration);
    failures.add(search.status !== 200);
  }
  // Cart changes are browser-local. Model the customer thinking/editing here.
  sleep(5 + Math.random() * 10);
}
