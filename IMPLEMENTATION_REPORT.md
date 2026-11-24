# Stratos Internship Platform Expansion

## Status

The repository audit, shared catalog, and the three public category landing pages are implemented. The full platform expansion is **not complete**: registration, new-category payments, student-record reconciliation, scheduled email, submissions, administration, and certificate issuance depend on external Worker code or owner configuration that is not present in this repository.

No new-category checkout is enabled. Its prices are proposals only. The existing Instant Internship homepage and payment flow were left unchanged.

## Existing architecture found

- **Hosting and routes:** Cloudflare Pages serves the static site. `_redirects` maps `/sign-in`, `/admin`, and `/my-internships` to their HTML entry points, and maps student detail paths to `my-internships-detail.html`. The three category routes are static directories with their own `index.html`.
- **Registration and payments:** The homepage sends registrations to the separate `stratos-register` Worker and uses the separate `stratos-payment` Worker for order creation, verification, and payment status. Neither Worker’s source is in this repository. The frontend currently sends a 100-paise amount for the existing Instant checkout; this behavior and its displayed ₹99/₹199/₹299 tiers were not changed.
- **Authentication:** The portal uses Firebase email-link authentication. No Firebase Phone Auth implementation or verified-phone ownership flow is present.
- **Firestore:** The registration notification Worker reads `artifacts/stratos-global-edu/public/data/orders/{registrationId}`. The student portal instead queries `enrollments/{registrationId}` using `studentUid`. The repository does not show a verified migration/link between those paths. Firestore rules deny client writes and permit student reads only for records in the `enrollments`, `submissions`, and `certificates` collections owned by the authenticated UID.
- **Email:** `worker.js` is the existing Brevo notification Worker. It currently handles registration and verified-payment notifications, uses Firestore notification markers, and has no scheduled-email handler/configuration. Its CORS allowlist currently names the legacy `stratos-internship.pages.dev` origin.
- **Administration:** `admin.html` is a placeholder and `functions/api/admin-action.js` returns HTTP 501. No administrator-claim provisioning process is included.
- **Project submissions:** `js/submission-config.js` has an empty Google Form URL. There are no supplied submission forms or synchronization credentials.
- **Certificates:** The repository contains a verification page, but no confirmed certificate-generation service/API or issuance workflow.

## Implemented in this change

- Added `js/internship-catalog.js` as the shared catalog for stable category IDs (`instant`, `short-term`, `long-term`, `summer`) and stable plan IDs. It includes the proposed tier amounts, durations, plan benefits, domains, project information, requirements, and enrollment/Form configuration. New categories explicitly have checkout disabled, no configured dates, and no configured Google Form.
- Expanded the Short-Term, Long-Term, and Summer pages to render from the catalog. Each has 20 domain cards, plan-specific scope and draft pricing, project requirements, workflow, certificate eligibility, FAQs, and a clear notice that enrollment is not open and no payment can be made.
- Refined all three category pages with compact, responsive category-specific hero copy; a dark internship overview card; truthful domain/plan/duration summaries; and shared category navigation. Added a mobile-specific stacked layout, accent-colored plan/domain treatments, a neutral "Balanced scope" plan recommendation, and a five-stage workflow that preserves the manual Google Form process without implying it is configured.
- Kept new-category checkout disabled and draft prices clearly labeled. No starting price, enrollment deadline, popularity claim, or enrollment statistic is advertised. The homepage, its counts/countdowns, and its payment flow remain unchanged.
- Added focused catalog checks to `npm test`.
- Preserved `index.html` exactly as it was at the start of this work, including its existing counts and countdowns.

## Not implemented yet

- **Unified registration and checkout:** Requires the registration and payment Worker source/contracts. New prices also need explicit owner approval before any production charging is enabled.
- **Student dashboard reconciliation and progress:** The existing dashboard only reads `enrollments`; the production registration path is `orders`. A safe, UID-verified mapping and compatible migration must be defined before showing those records or adding status actions.
- **Phone-number sign-in:** Requires a decision/configuration for Firebase Phone Auth or a verified-phone linkage through the existing email-auth account. Phone-number entry alone must not grant access.
- **Email schedules and lifecycle events:** Requires a scheduled Worker deployment configuration, idempotent event design, confirmed support details, and verified project/submission statuses.
- **Google Forms:** Requires the real category form URLs and an approved secure method to validate/synchronize submissions.
- **Admin/evaluation:** Requires server-verified administrator claims, provisioning, and authorized backend actions; the existing endpoint is intentionally non-functional.
- **Certificate issuance:** Requires the actual issuing service, template/credentials, and verification contract.
- **Legal and contact details:** Production registration requires approved Terms, Privacy Policy, refund/cancellation wording, support contact, and any required business disclosures. No values were invented.

## Validation

- `npm test` passed: Worker/catalog/page-module syntax checks and catalog invariants, including 20 domains and three plans per new category, disabled checkout, unset enrollment dates, and unset Form URLs.
- `git diff --check` passed.
- All three category pages were loaded in the local Cloudflare Pages preview. Long-Term plan/domain selection was exercised; the rendered pages and SEO metadata were inspected.
- No production payment, email, Firestore write, or deployment was performed.

## Owner/configuration checklist before later phases

1. Provide or grant access to the registration and payment Worker source/contracts.
2. Explicitly approve or revise the proposed prices and confirm the production checkout policy.
3. Supply the actual Google Form URLs, enrollment dates/deadlines, support contact, and legal policy URLs.
4. Confirm the Firebase Phone Auth configuration/billing decision and the existing-record UID-linkage process.
5. Provide the administrator custom-claim provisioning process and certificate issuance integration details.
