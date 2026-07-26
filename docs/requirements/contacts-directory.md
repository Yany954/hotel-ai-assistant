# Requirements — Contacts directory (pilot)

## User story
As front desk staff, I want to ask for a vendor or support contact by name or category, so that I
get the right number immediately without searching a binder.

## Data shape (revised)
- `organizationName` (required) — e.g. "CLC", "Tech Guru"
- `category` (required, closed set) — see docs/reference/contact-categories.md
- `accountNumber` (optional) — e.g. Coke A/C No, Golden Malted A/C, Hotel Engine account
- `phoneLines[]` (required, min 1) — each with `purpose`, `phoneNumber`, optional `contactPersonName`.
  Organizations with a single number just have one entry; CLC has 7 (accounting, checkin
  certified, contracts, ecommerce, main, fax, after-hours).

## Acceptance criteria
1. Exact or near-exact name/category match returns the correct contact with no ambiguity.
2. If a contact has multiple phone lines, the system returns the line matching the stated purpose
   (e.g. "after hours") rather than defaulting to the first/main line.
3. If multiple contacts could match, the system lists all candidates rather than guessing one.
4. Every contact record is traceable to who entered/updated it and when (admin panel audit log).

## Out of scope for this bounded context
Anything with conditional, multi-step logic (elevator down, guest trapped, card declined by
platform) is NOT a contact lookup — see docs/requirements/escalation-procedures.md.
