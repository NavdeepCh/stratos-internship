# Dedicated Payment Worker Architecture

## Architecture

- Frontend: Cloudflare Pages
- Registration Worker: `https://stratos-register.stratos-global.workers.dev/register`
- Payment Worker: `https://stratos-payment.stratos-global.workers.dev`
- Email Worker: `https://stratos-email-notifications.stratos-global.workers.dev/registration-notification`

Keep Razorpay credentials, webhook secrets and Firebase service-account credentials on the dedicated Workers, never in Pages or frontend code.

## Payment endpoints

- `POST /create-order`
- `POST /verify-payment`
- `POST /payment-status`
- `POST /webhook`

The `/webhook` endpoint is server-to-server only.

## Worker secrets

Configure the names in the dedicated Payment Worker and existing Workers:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_API_KEY`
- `BREVO_API_KEY`
- `NOTIFY_TO_EMAIL`

Do not commit values.

## Deployment

1. Deploy the `stratos-payment` Worker.
2. Configure the LIVE Razorpay webhook URL:
   `https://stratos-payment.stratos-global.workers.dev/webhook`
3. Deploy Cloudflare Pages after confirming every frontend payment call uses the dedicated Worker.
4. Deploy `worker.js` separately to `stratos-email-notifications` if notification code changes.

Payment success must be confirmed by server-side signature/capture verification and a durable Firestore payment update. Frontend callback values alone are not authoritative.
