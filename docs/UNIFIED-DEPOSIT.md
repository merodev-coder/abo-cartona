# Unified deposit proof workflow

For the subsequent uploader visibility, payment-readiness and RTL currency repair,
see [Checkout deposit repair](CHECKOUT-DEPOSIT-FIX.md). Zero-fee delivery now records
`NOT_REQUIRED` and does not request payment proof.

This update supersedes the earlier S3 upload and delivery deposit policy described
in the refinement report. It reuses the existing shared checkout component,
Express proof endpoint, UploadThing SDK/application, order models and admin review.

## Current rules

| Fulfillment | Deposit | Remaining balance |
| --- | --- | --- |
| Store pickup | 100 EGP, included in products total; no shipping fee | Products total minus 100 EGP |
| Home delivery | Exactly the configured governorate delivery fee | Products total |

The existing 100 EGP pickup minimum remains enforced. Delivery no longer applies
the legacy 50 EGP floor or full-order deposit option. Existing shipping fee records
still determine the delivery fee. Old orders retain their recorded amounts.

Pickup location is exactly **القاهرة - حدائق حلوان**. Checkout selection/details,
customer confirmation/status and admin views show it with a pin. No street,
building number, coordinates or Google Maps link is assumed. Pickup requires
contact details, but not a customer address.

## UploadThing and privacy

`PaymentDeposit.tsx` now exports the shared `DepositPaymentUpload` implementation.
Both fulfillment types use its gallery/file picker, desktop drag/drop, local image
preview, replacement/removal, progress and Arabic validation messages.

The existing Express `/api/orders/proofs` endpoint checks the cart, current shipping
fee, fulfillment and declared deposit before accepting evidence. It decodes
JPEG/PNG/WebP using Sharp, enforces the existing 5MB limit, strips metadata and
reencodes to WebP. It then calls the already-installed UploadThing `UTApi.uploadFiles`
with **`acl: 'private'`**. Progress covers browser-to-server transfer; the UI keeps
submission blocked during server validation and the UploadThing transfer.

No new upload provider was added. The old S3 helper is retained solely for reading
or cleaning up already-stored historical evidence; all new uploads use UploadThing.
The old generic Next.js attachment route remains blocked so it cannot bypass the
authoritative quote/image-validation path. Product UploadThing routes are unchanged.

Use the existing application's v7 `UPLOADTHING_TOKEN` on the Express backend.
Existing `UPLOADTHING_SECRET` / `UPLOADTHING_API_KEY` aliases remain supported.
These are server-only environment variables. In the UploadThing dashboard, allow
per-request private ACL overrides (or configure a suitable private app policy).
If a private upload cannot be performed, checkout fails closed and never retries
as a public upload. The SDK's [ACL requirements](https://docs.uploadthing.com/concepts/regions-acl)
and [UTApi methods](https://docs.uploadthing.com/api-reference/ut-api) describe this setup.

Only opaque proof IDs reach checkout. The order stores the UploadThing file key
and a `uploadthing:<key>` reference. Authorized customers/admins can obtain a
60-second signed URL through the existing authenticated proof endpoints. Public
CDN URLs are not returned or persisted as proof access links.

## Binding, states and storage

Proof records bind their owner, amount in piastres, fulfillment type, deposit type,
expiry and single-use order attachment. The final order recalculates everything
again. A wrong declared amount, stale shipping fee, wrong fulfillment or reused
proof is rejected. The client immediately discards proof on context changes,
aborts the previous request and requires another upload even after switching back.

New orders enter `PENDING_VERIFICATION`; upload does not verify payment. Admins
manually approve or reject with a reason. Verification history and the existing
transactional inventory/idempotency guards are retained. Rejected orders accept
new, owned evidence for their recorded deposit requirement.

To preserve existing data/API conventions without duplicating monetary authority:

| Requested field | Existing persisted field / mapping |
| --- | --- |
| fulfillmentMethod | Alias of `deliveryMethod` |
| deliveryFee | Alias of `shippingCost` (EGP) |
| depositAmount | Alias of `requiredDeposit` (EGP); authoritative `depositAmountMinor` |
| depositType | `STORE_PICKUP_DEPOSIT` or `DELIVERY_FEE_DEPOSIT` |
| depositProofFileKey | Private UploadThing key, excluded from ordinary projections |
| depositStatus | Includes `AWAITING_PAYMENT`, `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`; legacy states retained |
| remainingBalance | Derived from authoritative `remainingBalanceMinor` |
| depositSubmittedAt | Server timestamp |

## Validation and rollout

Executed checks:

- Backend: **37 test entries passed**, including isolated Mongo replica-set tests.
- Browser: **20 tests passed** against the production build, covering the nine
  responsive widths, pickup/delivery flows, context invalidation, in-progress and
  failed uploads, desktop drag/drop, removal, confirmation address and admin review.
- TypeScript and production build: passed.
- ESLint: zero errors, 159 warnings.
- Backend syntax build and `git diff --check`: passed.

UploadThing transfers are mocked in tests; signed-URL generation uses the installed
SDK with isolated fixture credentials. No real transfers, uploads or production
data changes are made. No UploadThing credentials are available in this local
checkout. A live private ACL/upload check and authenticated signed download remain
deployment verification steps using the existing configured application.

Deploy frontend and backend together because proof uploads now include checkout
context and `depositAmountMinor`. Ensure the backend has the same configured
UploadThing application token and real payment destinations. New proof upload does
not require S3 credentials. Legacy S3 credentials are needed only if historical
S3 evidence still has to be viewed/deleted. Existing orphan-proof cleanup continues
to use the appropriate provider for each storage key.
