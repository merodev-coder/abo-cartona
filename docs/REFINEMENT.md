# Storefront and checkout refinement

## Architecture and audit

The existing application is Next.js App Router / React 19 / Tailwind with Zustand
cart persistence. Customer checkout calls the Express service via
`NEXT_PUBLIC_API_BASE_URL`. Both services contain Mongoose models; the Express
service is now the sole order creation, fulfillment, payment and stock authority.
Legacy Next.js order endpoints forward to it. Deployment files describe Railway,
Vercel and Netlify; no deployment was performed.

Critical findings addressed: unauthenticated admin/order routes, client-controlled
totals, public proof uploads, a browser admin credential check and bypass token,
API-wide public caching, duplicate stock decrement paths, conflicting stock
operators, missing idempotency, missing payment review states, and a database
startup failure that previously allowed an unhealthy server to start.

## UI, typography and motion

The dark navy and emerald identity is retained. Shared surfaces, heading/body
sizes, radii, focus indicators and control spacing are standardized. Readex Pro is
retained as a single Arabic/Latin family because it matches the existing brand;
four weights load with next/font and swap. The second overlapping Arabic font is
removed. Existing CSS in `styles/tailwind.css` is not imported by the root layout;
its external font declarations are not part of the active font path.

The installed Framer Motion 12 React API is reused. Shared motion tokens and a
global MotionConfig respect reduced motion, following [Motion's accessibility API](https://motion.dev/docs/react-accessibility). Fulfillment uses native radios,
keyboard selection, clear indicators and press feedback. Checkout conditional
sections preserve form state. Payment previews and cart/product feedback use
short transitions. Full route remounts were avoided to preserve checkout state.
The root no longer loads the global Lenis/GSAP scrolling wrapper. Existing GSAP
modules remain available for components that still use them.

## Pickup policy and lifecycle

Pickup requires a **100 EGP minimum order** and **100 EGP deposit included in the
total**. A 650 EGP order leaves 550 EGP after verification. The customer uploads
proof and submits; the server recalculates prices, storage-data discounts and
shipping using database records. An uploaded image never verifies a payment.

New orders enter `PENDING_VERIFICATION`, with fulfillment `Pending`. Admins review
the payment in the actual store account, view a 60-second signed proof URL, then
approve or reject with a reason. Review history records actor, time and reason.
Only pending evidence can be reviewed. The customer sees live status and can
upload fresh evidence after rejection from the original browser. Guest access is
protected by a random browser capability token whose hash is stored on the order;
losing browser storage requires assistance from the store. Cross-device account
recovery is not implemented because the existing store has no customer accounts.

Pickup orders awaiting review **do not reserve stock**. Availability is checked
on submission and again on approval; stock is allocated atomically on approval.
An admin cannot approve unavailable inventory. This avoids unpaid reservations
locking stock; it does mean stock is not guaranteed until review. Delivery retains
its configured shipping/deposit calculation and allocates stock at submission.
Shipment creation is available through the existing authorized admin action;
checkout no longer creates a real shipment before the manual payment is reviewed.
Cancellation releases committed inventory once. Payment state remains separate;
this implementation does not execute refunds or claim that a cancelled payment
has been refunded.

## Private storage and security setup

1. Set the backend payment destinations, admin credentials and a strong JWT secret
   in `backend/.env.example`. Remove any deployed `NEXT_PUBLIC_ADMIN_*` variables
   and rotate credentials previously exposed in browser bundles.
2. Configure a private S3-compatible bucket using `PROOF_S3_*` and AWS credential
   variables. Block public access and scope the application principal to
   `PutObject`, `GetObject`, `DeleteObject` under `payment-proofs/*` only. Use TLS,
   provider encryption at rest and a suitable retention policy. No public bucket
   ACL is requested. Methods are disabled until destinations and storage exist.
3. Set the actual `TRUST_PROXY_HOPS`. The default trusts no proxy. CORS accepts
   requesting origins without an origin allowlist. Login and upload limits use
   shared Mongo counters, not per-process state.
4. MongoDB must support transactions (replica set/Atlas). Apply additive indexes
   during a controlled rollout; no production backfill or destructive migration
   was run. Existing orders are not automatically marked verified.
5. Schedule `npm --prefix backend run cleanup:proofs` daily. It deletes expired,
   unattached objects before removing metadata, allowing retries on storage errors.
   Configure object-storage inventory cleanup for the rare crash between object
   write and metadata insertion; do not blindly expire attached order evidence.
6. Legacy screenshots already stored publicly need a separately reviewed private
   migration and removal from public storage/CDNs. New checkout never accepts
   legacy public URLs. This change does not retroactively privatize old files.

Uploads are capped at 5MB (configurable downward), decoded with Sharp, restricted
to JPEG/PNG/WebP, pixel-limited, reencoded and stripped of metadata. Filenames and
client MIME are not trusted. Proof IDs are owned, expire before attachment and can
be bound only once. Request bodies are bounded, errors are redacted, private API
responses use no-store, and server-signed admin roles are checked.

## Performance and capacity validation

Actual build and QA results are recorded in `docs/VALIDATION.md`. No before-change
Lighthouse run or real-user dataset was available. Bundle output is a measurement,
not a Core Web Vitals result. LCP/INP/CLS at the 75th percentile remain unverified.

The backend is stateless with shared Mongo counters, pooled connections,
transactional inventory, bounded order lists, private shared object storage and
graceful shutdown. These are prerequisites, not proof of 1,000-user capacity.

`backend/load/storefront.js` ramps 100 → 500 → 1,000 active VUs, holds five minutes,
and ramps down with browse/detail/search and 8–23 seconds of combined think time.
Cart activity is local. Run checkout separately with `backend/load/checkout.js`:
it exercises private upload, pickup/delivery order creation and idempotent retries.
Use seeded expendable inventory, a dedicated Mongo replica set, a private test
bucket, test payment destinations, no real shipping credentials and no outbound
customer notifications. The load scripts require explicit isolated-run variables.
Per-IP limits must be tested with representative distributed source IPs; a single
load generator can otherwise measure the limiter instead of application capacity.
Do not disable protections in production to obtain a benchmark.

Example isolated commands:

```powershell
$env:BASE_URL='http://isolated-backend:8080'
$env:ALLOW_ISOLATED_LOAD='true'
k6 run --summary-export=load-read-results.json backend/load/storefront.js
# Also configure PRODUCT_ID, PRODUCT_PRICE, PAYMENT_METHOD, PROOF_FILE,
# GOVERNORATE and SHIPPING_METHOD before running checkout.js.
k6 run --summary-export=load-checkout-results.json backend/load/checkout.js
```

Collect k6 throughput, p50/p95/p99 and errors alongside application CPU/RSS and
Mongo connections, slow queries and transaction retries. Read target: p95 <500ms,
errors <1%; uploads and checkout require separate budgets. Independently reconcile
orders, proof bindings and stock after the run. No 1,000-user result is claimed.

## Significant files

- `frontend/src/styles/globals.css`, `tailwind.config.ts`, `app/layout.tsx`,
  `app/providers.tsx`, `lib/motionTokens.ts`: shared visual and motion system.
- `frontend/src/app/checkout/` and `components/checkout/`: fulfillment, secure
  proof upload, money summary, status/resubmission and pickup information.
- `frontend/src/components/admin/DepositReview.tsx` and admin order details:
  protected evidence viewing and review controls.
- `backend/controllers/secureCheckoutController.js`, `depositController.js`,
  `models/Order.js`, `models/PaymentProof.js`, `utils/checkoutQuote.js`,
  `commitInventory.js`, `proofStorage.js`: authoritative checkout and payment flow.
- `backend/middleware/`, `utils/MongoRateStore.js`, `config/db.js`, `server.js`:
  authorization, shared abuse limits, bounded requests, pool and lifecycle handling.
- Next.js order proxies/admin auth handlers: remove alternate checkout bypasses,
  public credential checks and default/bypass credentials.
- `backend/tests/`, `frontend/tests/e2e/`, `backend/load/`: assertions and repeatable
  workload scripts. Package manifests/lockfiles and environment examples updated.

Existing formatting violations were normalized using the repository's configured
Prettier style; some changed files contain formatting-only edits.

## Repeatable checks

```powershell
npm --prefix backend test
npm --prefix backend run build
npm --prefix frontend run type-check
npm --prefix frontend run lint
npm --prefix frontend run build
cd frontend
npm run build
npx playwright test
```

The backend integration suite downloads a temporary MongoDB binary on its first
run, creates an isolated replica set and destroys it afterward. S3 writes are
mocked; real provider IAM/signing integration still requires the configured bucket.
Playwright starts the production build and uses installed Edge on Windows and Chromium elsewhere. Its API fixtures
test browser behavior independently from backend integration tests; they do not
claim live payment-provider verification.
