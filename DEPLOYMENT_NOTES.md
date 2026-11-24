# Payment Worker Deployment Notes

The frontend uses the dedicated `stratos-payment` Worker:

- `POST /create-order`
- `POST /verify-payment`
- `POST /payment-status`
- `POST /webhook`

## Worker configuration

Configure secrets only on the dedicated `stratos-payment` Worker:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_API_KEY` only if token verification is required by the Worker

Keep Brevo secrets on `stratos-email-notifications`.

## Razorpay webhook

Configure the LIVE webhook at:

`https://stratos-payment.stratos-global.workers.dev/webhook`

Enable `payment.captured`, `payment.failed`, and review refund events separately.

## Payment behavior

The dedicated Worker remains authoritative for ₹1 (100 paise) testing charges, signature verification, captured status, payment state, and Firestore updates. Browser callbacks must never mark success directly.
