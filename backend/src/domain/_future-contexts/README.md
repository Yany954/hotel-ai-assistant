# Future bounded contexts

`escalation/` (conditional multi-step procedures like elevator-down or card-declined) already has
its domain entities scaffolded — see ../escalation/. Application and infrastructure layers for it
are still TODO; build those after the room + contacts pilot is validated.

Still fully future, following the same pattern once escalation is proven out:

- `shift-training/` — duties by shift
- `maintenance/` — TV remote, door battery, AC/boiler reset

Do not add these until the pilot (rooms + contacts) is validated with real front desk usage.
