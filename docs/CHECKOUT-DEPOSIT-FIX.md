# Checkout deposit repair

## Root causes

- The shared upload control was inside the branch for available payment methods.
  Missing configuration and API failures therefore removed the control entirely.
- `/api/orders/payment-config` returned an empty method list whenever UploadThing
  storage was unconfigured, even when transfer destinations existed. The UI could
  not distinguish missing destinations, missing storage and failed requests.
- Checkout mixed raw `Intl` currency strings, interpolated amounts and Arabic
  suffixes without a consistent direction boundary or decimal policy.
- Final submission required proof even for a zero shipping fee, and did not
  recheck whether an uploaded proof's payment method was still configured.

A read-only request to the deployed Render payment-config endpoint returned HTTP
200 and zero methods. That older response has no readiness flags, so it cannot
establish which server environment setting is absent. No production settings were
changed.

## Implemented behavior

The existing `DepositPaymentUpload` remains the single upload component. For every
positive deposit it always renders the image picker/drop area, including while
configuration is loading, unavailable or incomplete. Customers can select and
preview an image without configuration; no upload/payment claim or final order
is allowed until a real destination and usable upload configuration are present.
Separate Arabic warnings identify destination, storage and request failures.
Failed configuration requests offer retry; failed transfers retain the selected
file for explicit retry. Removal clears the proof; replacement uses the same flow.

The dark/emerald section has a compact responsive summary, Arabic file selection
control, drag feedback, accessible progress, and subtle Motion transitions with
reduced-motion support. `Currency` separates the numeric value and Arabic currency
label with bidi boundaries; one cached `Intl.NumberFormat` provides grouping and
two decimals throughout the active checkout, cart review and confirmation/status.

Pickup requires 100 EGP, no shipping and no customer address, with the existing
100 EGP minimum and **القاهرة - حدائق حلوان** pickup address retained. Delivery
requires exactly its current shipping fee. Zero-fee delivery requires no proof or
payment destination and records `NOT_REQUIRED`. Positive deposits record
`PENDING_VERIFICATION`, never automatic verification.

The backend recalculates all amounts and validates owned, unexpired, single-use
proof references. Final submission and rejection resubmission also reject payment
methods that have since been disabled. Existing transactions, idempotency and
inventory guards remain intact. JPEG/PNG/WebP decoding, 5MB limits, private
UploadThing storage and authenticated signed downloads are retained.

## Required deployment settings

Configure these on the **Express backend**, even if UploadThing is already
configured on Next.js:

- `UPLOADTHING_TOKEN`: the existing application's dashboard-issued base64 v7
  token. A raw `sk_` API key is insufficient. Legacy variable aliases accept the
  same encoded token. Missing/malformed tokens now report upload readiness false.
- `PAYMENT_INSTAPAY_DESTINATION` and/or `PAYMENT_VODAFONE_DESTINATION`: only real
  store-owned transfer destinations. Whitespace-only values are ignored.
- `PROOF_MAX_BYTES=5242880` (or a smaller configured limit).
- Allow private ACL overrides in the existing UploadThing application. Failed
  private uploads fail closed; the application never falls back to public files.

Deploy frontend and backend together. Public payment-config responses contain
only transfer destinations and readiness booleans, never the UploadThing token.
No database migration is required.

## Verification

- Backend test suite: 40 passing entries, including isolated Mongo replica-set
  coverage of private provider failures, destination removal, malformed token
  readiness, zero-fee delivery, proof authorization, idempotency and stock races.
- Production browser suite: 25 passing tests, covering both fulfillment methods,
  nine widths (320–1920px), configuration failures, visible upload controls,
  drag/drop, retry/removal, fee changes, submission blocking and admin review.
- TypeScript, frontend production build, backend syntax build: passed.
- ESLint: zero errors; 159 existing warnings remain.
- Desktop and mobile screenshots are saved under `frontend/qa/`.
- After the final spacing adjustment, the 390px and 1440px production browser
  checks were rerun successfully and their deposit screenshots inspected.

Browser API responses and UploadThing transfers are mocked with isolated test
data. No real transfer or successful live UploadThing upload is claimed. Live
private upload and authorized signed-download verification require the store's
configured credentials and remain deployment checks. No production data or real
money was modified, and no scalability result is claimed by this repair.
