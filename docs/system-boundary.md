# System boundary — Front Desk AI Assistant

(Thinking in Systems — Meadows: define the boundary before building, or scope creep becomes the biggest risk to the project.)

## In scope (pilot)
- Room matching from a natural-language description of guest needs.
- Contacts directory lookup (vendors, support lines, internal extensions).

## In scope (future phases, same pattern)
- Third-party escalation guidance (Booking/Expedia card-decline paths).
- Shift trainer (duties by shift).
- Maintenance how-to (TV remote, door battery, AC/boiler reset).

## Explicitly OUT of scope
- No live connection to Synxis or any existing hotel system of record. This assistant reads from
  its own curated data, populated/updated through the admin panel — it does not write to or read
  live from production hotel systems.
- No payment actions. The assistant explains steps; it never charges, refunds, or modifies a
  reservation itself.
- No guest-facing access. Front desk staff and admin only.

## Feedback loop to protect
Staff trust is the main reinforcing loop: one confidently wrong answer reduces future usage more
than a missing answer does. This is why room matching uses deterministic filters instead of
free-text similarity search — see docs/requirements/room-matching.md.
