# Razorpay and Brevo Backend Setup

## Root cause

The existing Razorpay verification endpoint confirmed the checkout signature and payment capture but did not patch Firestore. The existing notification Worker sent only one registration notification and used no separate payment confirmation marker.

## Test status

- Backend JavaScript syntax: passed
- Reconciliation script: correctly entered dry-run and stopped without writing records because credentials were not supplied to the shell
- No production payment or live charge was processed

## Cloudflare Pages variables

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `FIREBASE_API_KEY`
- `GOOGLE_SERVICE_ACCOUNT_JSON`

The service-account JSON remains a server secret.

## Razorpay webhook

Configure in the Razorpay Dashboard:

`https://internships.stratosglobal.tech/api/razorpay-webhook`

Or use the deployed Pages domain:

`https://stratos-internship.pages.dev/api/razorpay-webhook`

Enable:

- `payment.captured`
- `payment.failed`
- `refund.processed`

Set the webhook secret to `RAZORPAY_WEBHOOK_SECRET`.

## Brevo Worker variables

Keep:

- `BREVO_API_KEY`
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `NOTIFY_TO_EMAIL`

## Deployment

Deploy the Pages `functions/api/` directory for order, verification, and webhook routes.

The existing `worker.js` must be deployed separately to the `stratos-email-notifications` Cloudflare Worker.
