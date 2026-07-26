# Requirements — Room matching (pilot)

(Format follows Wiegers & Beatty: user story + explicit acceptance criteria, written before
implementation.)

## User story
As front desk staff, I want to describe a guest's room needs in plain language, so that I get
back only the rooms that actually satisfy every stated requirement.

## Data shape
See `Room` entity in `backend/src/domain/rooms/entities/room.ts`. Attributes: bed configuration
(count + queen/king), shower type (tub/walk-in), bed clearance (flush to floor / gap underneath),
accessibility, kitchen, pull-out sofa bed, separate small sofa, carpet, view (street/parking lot),
curtain type (electric/manual), room class (suite/regular). `roomTypeCode` (e.g. "PNK1") is kept
for staff reference only — matching never uses it directly.

## Acceptance criteria
1. Given any combination of the attributes above as constraints, the system returns only rooms
   matching ALL stated constraints — zero false positives.
2. If no room matches all constraints, the system says so explicitly rather than returning a
   partial or "closest" match without flagging it as partial.
3. Constraints not mentioned by the user (e.g. floor, curtain type) are not used to exclude rooms.
4. Matching is done via structured filtering (see `matchesAllStatedCriteria`), not semantic
   similarity — see ADR 0001.
5. Given the hotel's small size (89 rooms), the repository may fetch the full collection and
   filter in application code rather than building per-field database queries — see
   `backend/src/infrastructure/persistence/firestore/README.md`.

## Out of scope for pilot
- Real-time inventory/availability sync (this answers "which room TYPES fit", not "what's free
  tonight" — that still requires checking the PMS manually until a later phase, if ever).
