# Repository upgrade — staged, not production activated

Updated all nine category plans, prices, domain-first navigation, search, premium styling and certificate benefits. Existing homepage and Worker source unchanged. Summer prices retain previously proposed 149/349 INR. All new enrollments and payments remain disabled. No fake enrollment counters or deadlines added.

Student portal now reads the existing orders path by authenticated UID; proposed rules allow verified owner/admin reads only. Existing anonymous registrations require a secure ownership migration before appearing in the verified portal. Do not deploy these rules over live rules without reviewing the existing Instant flow and merging permissions. Admin remains a placeholder; no admin writes enabled. Document status is displayed, but generation, secure download and email dispatch are not implemented. Google Forms remain manually distributed.

## Activation blockers
- Review actual deployed registration, payment and email Workers; implement trusted server-side category/plan catalog, free enrollment and per-plan payment amounts, idempotency, capture verification and refunds. Preserve legacy Instant ₹1 flow.
- Implement authenticated registration UI/API contract and secure ownership migration. Do not use phone or email text alone to link records.
- Implement PDF generation, private storage, QR verification, email retry and authorized admin review.
- Configure real deadlines, counts and form links only when available.
- Test in staging, including browser/mobile, Firebase rules and payment sandbox before activation.

## Tests
`npm test` checks catalog, pricing, eligibility, disabled checkout and syntax. No live services contacted. Browser and end-to-end tests not performed.

## Additional repository changes
- Category application preview validates domain, plan, name and phone locally; no personal data transmitted or saved. Capability contract helper prepared, not wired to activate checkout.
- Admin read-only dashboard checks verified email and admin claim, then queries up to 200 orders; filters category, payment and registration/name. Counts are sample counts, not global totals. Server rules must authorize access. No review mutations.
- Original Firestore rules restored; proposed rules saved separately as firestore.proposed.rules for review. No deployment.
