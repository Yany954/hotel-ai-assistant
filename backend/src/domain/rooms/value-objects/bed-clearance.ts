// Whether the bed frame sits flush with the floor or has a gap underneath. Relevant for guests
// who need floor clearance (e.g. wheelchair users transferring, or a guest with a service animal
// that needs to fit underneath) — independent of the isAccessible/handicap flag, since this can
// vary room to room regardless of whether the room is formally a handicap room.
export type BedClearance = "flush_to_floor" | "gap_underneath";
