# Payment backend patch — review before deployment

## Changes
- `functions/api/_shared.js`: Firebase ID-token signature validation, Firestore authentication, ownership and helpers.
- `create-order.js`: authenticates user, verifies registration ownership and tier, charges a fixed live ₹1 (100 paise) for valid tiers.
- `verify-payment.js`: checks checkout HMAC, fetches Razorpay payment AND order, verifies registration receipt, ownership, amount, currency and captured status before updating Firestore. Handles duplicate verification.
- `payment-status.js`: authenticates status checks; no longer lets browser-controlled cancellation/failure overwrite payment records.
- `razorpay-webhook.js`: uses Razorpay event ID header, validates the fixed ₹1 amount, records processed events only after successful Firestore update so failed processing can retry.
- `index.html`: sends Firebase bearer token on payment-state report requests.

## Deployment checklist
1. Back up current repository and deployed Pages environment. Review changes before merge.
2. In Cloudflare Pages, set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `GOOGLE_SERVICE_ACCOUNT_JSON` as secure environment values. Confirm Pages Functions are enabled and `/api/*` requests reach them.
3. All newly created orders charge ₹1 (100 paise), with verification and webhook matching that amount. No test-mode flag is needed. Keep existing live credentials. Firestore paymentAmount is stored in paise; email displays rupees.
4. Configure Razorpay webhook URL `/api/razorpay-webhook` with payment.captured and payment.failed; review refund event handling separately. The existing refund.processed code may need additional event-specific logic.
5. Deploy `worker.js` separately only if its existing notification Worker needs changes. This patch does not deploy or change that Worker.
6. Test authenticated success, failed signatures, wrong receipt, wrong amount, wrong Firebase user, duplicated callbacks, closed browser, webhook retries and concurrent writes using test-mode credentials.
7. Existing paid-but-unverified records require **manual reconciliation** against Razorpay before any status correction. Do not charge again.

## Limitations
- No live gateway/Firestore tests were performed. No deployment was performed.
- Webhook event marker creation is after the Firestore update; concurrent duplicate deliveries may still race. For stronger guarantees use a Firestore transaction with event ID preconditions.
- Email delivery remains driven by frontend callback. For browser-closed payments, a backend notification queue/event should be added.
- Existing webhook `refund.processed` logic is not a complete refund accounting implementation.
- Existing order creation may create duplicate unpaid Razorpay orders on repeated submission; consider a server-side idempotent order mapping.


## Live ₹1 configuration
Deploy the Pages project with existing live credentials. Remove the obsolete RAZORPAY_TEST_ONE_RUPEE variable if present. The separate email Worker is not deployed by this ZIP. No live transactions were executed.
