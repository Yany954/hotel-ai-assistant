## Rooms
Only 89 rooms total, so `room-repository.impl.ts` fetches the whole `rooms` collection and filters
in plain application code (see `matchesAllStatedCriteria`) instead of building composite Firestore
queries. This sidesteps composite-index management entirely at this scale and keeps the matching
logic itself testable without touching a live database. Revisit only if room count grows by an
order of magnitude.

## Contacts
No native fuzzy/full-text search in Firestore (see contact-repository.impl.ts) — exact category
match plus a simple "starts with" name match. Acceptable given controlled categories maintained
through the admin panel; revisit with Algolia/Typesense only if this becomes a real pain point.
