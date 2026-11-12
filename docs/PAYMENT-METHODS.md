# Checkout receiving methods

The existing deposit component and private UploadThing workflow are retained.
The payment selector now presents Vodafone Cash and InstaPay cards, selected
checkmarks, Arabic instructions, dynamic required amounts, and an LTR-isolated
receiving identifier with clipboard success/failure feedback.

## Server configuration

`backend/utils/paymentConfig.js` is the single source for available receiving
methods. Vodafone Cash defaults to the owner-supplied **+20 106 795 7449**, including
when an old destination environment variable is empty. Copying the displayed
number produces **+201067957449**. The number is supplied by the API; it is not
duplicated in customer components.

Existing environment settings remain supported:

```dotenv
PAYMENT_VODAFONE_DESTINATION=+20 106 795 7449
PAYMENT_VODAFONE_ENABLED=true
PAYMENT_INSTAPAY_DESTINATION=+20 106 795 7449
PAYMENT_INSTAPAY_CONFIRMED=true
```

The owner explicitly confirmed that this phone receives InstaPay transfers during
implementation. Both methods therefore default to enabled for the exact supplied
number. Set `PAYMENT_INSTAPAY_CONFIRMED=false` to explicitly disable InstaPay.
This confirmation does not verify any individual customer payment. Vodafone can be
explicitly disabled with `PAYMENT_VODAFONE_ENABLED=false`; blank destination values
alone no longer disable either default. Environment overrides take precedence, so
check that any existing receiving destination matches the supplied number.

The existing private UploadThing v7 token and ACL configuration are still required
on the Express backend. Transfer details do not replace upload-service credentials.
No live payment, account settings or production environment was changed.

## Proof binding and order data

Upload requests accept existing method IDs or their canonical codes. New proofs
and orders store `VODAFONE_CASH` or `INSTAPAY`, the backend-configured
`paymentDestination` snapshot, authoritative deposit amount, private proof key,
and pending review status. Client-supplied destination and payment status values
are ignored. Final submission and rejected-proof resubmission verify that the
saved receiving destination is still enabled and unchanged.

Changing the selected method clears the previous image/proof, requiring a new
upload. Unsubmitted proofs created before this update lack a destination snapshot
and require re-upload; existing submitted orders remain readable and reviewable.
Admin order details display friendly labels for both old and new method codes and
the receiving destination recorded at submission. Signed proof access and manual
approval/rejection remain unchanged. No destructive data migration is required.

Pickup stays 100 EGP with the existing minimum, pickup address and remaining
balance policy. Delivery uses exactly its calculated fee, with no extra deposit
charge. Zero-fee delivery requires no claim or image. Positive deposits enter
`PENDING_VERIFICATION`; screenshots never approve payments automatically.

## Executed validation

- Backend: **43 passing test entries**, including isolated Mongo replica-set
  tests and both stored canonical payment methods/destination snapshots.
- Browser: **30 scenarios passed** against the production build in Edge. The
  first run passed 29; the admin assertion also matched the footer phone. After
  scoping that assertion to order details, the admin scenario passed on rerun.
- TypeScript, production frontend build and backend syntax build passed.
- ESLint: zero errors, 159 existing warnings.
- The 390px and 1440px selector screenshots were captured and visually inspected:
  `frontend/qa/payment-methods-390.png` and `payment-methods-1440.png`.

Backend tests cover both canonical methods, configured receiving details, owner
authorization, changed/disabled destinations, private storage failures, amount
validation, zero-fee delivery and manual review. Browser tests cover selectable
cards, unconfirmed InstaPay, exact clipboard output, clipboard failure, proof
invalidation when methods change, admin labels, and mobile/desktop rendering.
Browser responses and UploadThing transfers use isolated mocks; they do not
establish that a live transfer or upload succeeded. Frontend and backend changes
must be deployed together; no deployment was performed.
