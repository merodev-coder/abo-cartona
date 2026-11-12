# Validation record

This records the previous refinement baseline. See [UNIFIED-DEPOSIT.md](UNIFIED-DEPOSIT.md)
for the subsequent UploadThing unification and its validation results.

Environment: Windows, Node 24.22.0, npm 11.19.1, Next.js 15.5.29,
React 19.0.3, installed Microsoft Edge in headless mode, local production build.
No production data, actual payment transfers or production deployment were used.

## Executed checks

| Check | Result |
| --- | --- |
| Backend `node --test tests/*.test.js` | 30 entries passed, zero failures |
| Isolated MongoDB 7.0.14 replica set | Transactions, proof ownership/binding, idempotency, review audit, resubmission, stock contention and delivery exercised |
| Frontend TypeScript | Passed |
| Frontend ESLint | Passed with 158 warnings, zero errors in the most recent standalone run |
| Frontend production build | Passed with lint and type checking enabled; 22 static pages generated |
| Backend syntax build | Passed; repeated after final backend edits |
| Playwright | **16 passed in 40.6 seconds** against the final production build: nine widths, storefront/cart navigation, payment validation, upload submission, reduced motion, delivery and admin review |
| `git diff --check` | Passed |

The original legacy `inventorySync.test.js` is an executable module import rather
than an assertion-based test. Node includes it in the entry count; the new
integration suite performs actual assertions against transactional stock changes.
S3 writes are mocked in the database integration suite. Signed URLs are generated
with isolated fixture credentials and their lifetime/access guards are asserted.
Browser API fixtures are mocked independently; they validate the UI rather than
live provider behavior.

Visual artifacts: `frontend/qa/checkout-390.png`, `frontend/qa/checkout-1440.png`.
Production build output: `frontend/qa/production-build.txt`.

Initial attempts hit sandbox network restrictions, missing browser binaries and
the first MongoDB binary download timeout. The required dependencies/binary were
installed, installed Edge was selected, and the database suite was rerun. A later
development-server restart interrupted a navigation assertion, so browser QA was
moved to the production server. These failed attempts are not counted as passes.
The expanded suite also caught initial-hydration focus stealing from radio
controls and a governorate dropdown covered by the following payment card. Both
were corrected before the final regression run; no forced clicks were used.

## Measurements actually obtained

Latest production build reports:

| Route | Route JS | First-load JS |
| --- | ---: | ---: |
| Home | 10.4 kB | 269 kB |
| Products | 8.9 kB | 268 kB |
| Checkout | 19.9 kB | 296 kB |
| Admin | 153 kB | 394 kB |

Shared first-load JS: 103 kB. These are Next.js build estimates, not transferred
bytes under a measured network profile. The admin page remains a large bundle.
No reliable before-change build, Lighthouse baseline, real-user LCP/INP/CLS,
CPU/memory load profile, or 1,000-user test was collected. No numeric speedup,
Lighthouse 90+, p75 Web Vitals target, or supported concurrency is claimed.

Concrete changes include one font family/four configured weights instead of two
overlapping font families, removal of Lenis/GSAP from the root layout, enabled
Next Image optimization for configured hosts, retained direct rendering for
other existing image hosts, cached/deduplicated payment configuration queries,
bounded admin order queries, and corrected subscription cleanup.

## Dependency review

Initial frontend audit: 16 findings (9 moderate, 6 high, 1 critical).
After the Next.js/Sharp/PostCSS updates: 15 findings (10 moderate, 5 high,
0 critical). Remaining findings include UploadThing/Effect and tooling
transitives; they require separately verified compatible upgrades. No blind
forced downgrade or incompatible audit fix was applied.

Initial backend audit: 13 findings (4 low, 3 moderate, 6 high). Multer and Zod were
updated. Spreadsheet import, legacy upload seeding and mail smoke-test tools were
moved to development dependencies; their commands remain available. Final
production-only audit: **4 low, 0 moderate, 0 high, 0 critical**, all in the existing
Resend rendering dependency chain. Development/seeding dependencies retain
findings, including the npm SheetJS package. These findings remain unresolved;
the application is not represented as vulnerability-free.

## Remaining verification and setup

- Real private-bucket access policy, upload/download, retention and provider IAM.
- Actual store-owned payment destinations and store pickup details.
- Deployment origins/proxy settings, matching backend/frontend JWT secret and
  admin credentials. Previously exposed browser credentials must be rotated.
- Verified sender identity (`RESEND_FROM`), receipt and review emails, and shipping
  provider behavior in staging. Email notifications are best-effort after commit.
- Migration/removal of legacy publicly accessible screenshots.
- Broader live-catalog navigation/product-detail QA and a full manual WCAG audit.
- Lighthouse and RUM with production-like content/network conditions.
- Guarded k6 workloads on an isolated, production-like deployment; CPU/RSS,
  database latency and invariant reconciliation. The load scripts were authored
  but no valid 1,000-VU workload was executed in this session.

See `REFINEMENT.md` for architecture, business policy, commands and rollout steps.
