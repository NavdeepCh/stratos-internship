# Stratos Student Portal Upgrade

## Multi-category preview

The feature branch provides the four public category routes:

- `/`
- `/short-term-internships`
- `/long-term-internships`
- `/summer-internships`
- `/instant-internship-certificate`

## Repository status

This workspace contains the public homepage and certificate portal, Razorpay Pages Functions, Firebase browser configuration, and a notification Worker. It does not contain the full production category-page source, deployed registration Worker source, Google Form URL, or Firebase admin custom-claim provisioning.

## Added files

- `sign-in.html` - passwordless Firebase email-link sign-in
- `my-internships.html` - authenticated student dashboard
- `my-internships-detail.html` - protected enrollment/project detail
- `admin.html` - noindex admin review shell
- `js/firebase.js` - Firebase initialization and sign-in helpers
- `js/auth.js` - authentication guard
- `js/enrollment-service.js` - student-owned enrollment reads
- `js/projects.js` - centralized project definitions
- `js/portal-shell.js` - reusable navbar authentication state
- `functions/api/admin-action.js` - intentionally blocked until secure custom claims exist
- `firestore.rules` - client read/update boundaries
- `firebase.json` - emulator and rule configuration
- `_redirects` - clean URL routing

## Authentication setup

Enable Email Link sign-in in Firebase and authorize:

- `https://internships.stratosglobal.tech`
- `https://stratos-internship.pages.dev`
- `http://localhost:8788`

Existing anonymous users must be linked through a reviewed backend process. Do not merge accounts solely by email or phone.

## Firestore

The dashboard reads `enrollments/{registrationId}` and requires `studentUid`. Deploy rules:

```powershell
firebase deploy --only firestore:rules
```

Use Firebase Admin SDK custom claims for administrators. Never use an email allowlist in browser code as authorization.

## Blocked configuration

The following cannot be safely invented from this workspace:

- Real Google Form URL
- Production registration Worker source
- Enrollment-to-Firebase UID linkage
- Full category-page source
- Firebase Admin custom-claim provisioning
- Certificate generation credentials and template workflow
- Google Sheets automation

## Cloudflare Pages

Set server-only variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `FIREBASE_API_KEY`

Run locally:

```powershell
npm install
npm run dev
```
