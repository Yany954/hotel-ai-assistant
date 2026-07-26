# Requirements — Escalation procedures

(Format follows Wiegers & Beatty: user story + explicit, testable acceptance criteria.)

## User story
As front desk staff, I want to describe a situation (elevator down, card declined, guest trapped)
and get the correct next step and contact, so I never have to guess or search under pressure.

## Acceptance criteria
1. **Emergency override is checked first, before any AI classification.** A plain keyword/
   situation match for danger signals (trapped, injured, fire, medical) routes straight to the
   relevant emergency contact. This must never depend on model confidence.
2. Non-emergency situations are classified by the LLM into one of a closed set of known
   `triggerSituation` values — never open-ended text the model invents on the spot.
3. Once classified, the correct step is selected by deterministic code evaluating each step's
   `condition` against the reported situation (e.g. "reset attempted 3 times") — the LLM does not
   pick the contact itself, only the situation label.
4. Every escalation step resolves to exactly one `Contact` (via `contactId`) — no duplicated phone
   numbers inside the procedure itself.
5. `isEmergency` steps are visually/behaviorally distinct in the UI (e.g. surfaced immediately,
   not buried in a longer response).

## Example: elevator down
- Step 1 (no condition): front desk attempts reset, up to 3 times.
- Step 2 (condition: "guest trapped", isEmergency: true): call fire department immediately —
  independent of reset count, checked first per criterion 1.
- Step 3 (condition: "reset attempted 3 times with no luck"): call TK elevator service.
