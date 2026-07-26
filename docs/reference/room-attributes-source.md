# Room attributes — source data (Quinta Inn & Suites, Rock Hill)

Raw notes as provided by the hotel, kept here as the reference for whoever populates the
`rooms` collection in Firestore. Total: 89 rooms.

## Shower/tub
- Rooms with tubs: 201, 223, 225, 227, 229, 301, 323, 325, 327, 321, 329, 401, 423, 425, 427, 429
- Rooms with showers: 101, 102, 103, 104, 105, 107, 202-220 (odds/evens as listed), 302-328,
  402-428 (see original notes for full list)
- Room 101 is the ONLY room with a walk-in shower (all other "shower" rooms are tub/shower combo
  unless entered otherwise)

## Internal room-type codes (staff-facing only — never used for matching, see
docs/requirements/room-matching.md)
- PNQ2 — Queen handicap room, front of hotel, only 1 of its kind: room 214
- PNK19 — King handicap room with sofa bed, front of hotel, only 1 of its kind, more for hearing
  impaired than wheelchair use: room 218
- PNK1 — King handicap rooms, back of hotel, odd numbers, 4 total: 101, 201, 301, 401
- ENK1 — King suite, front of hotel, even numbers, pull-out sofa, 3 total: 228, 328, 428
- END1 — Queen suite, back of hotel, odd numbers, 3 total: 229, 329, 429
- NK2 — King rooms, front of hotel, even numbers, 25 total
- NDD2 — Queen rooms, back of hotel, odd numbers, 38 total
- NDD29 — Queen rooms with pull-out couch, front of hotel, even numbers, 14 total

## Additional attributes (not yet broken out per room — capture during data entry)
- Kitchen (sink + cooking area): present or not, varies per room
- Bed clearance: flush to floor, or gap underneath — varies per room, independent of handicap flag
- Small sofa (not a pull-out bed): present or not, varies per room
- View: Springdale street-facing, or back parking-lot-facing
- Curtains: electric or manual
- Carpet: present or not
