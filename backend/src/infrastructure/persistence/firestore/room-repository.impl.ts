// Concrete adapter implementing the RoomRepository port using Firestore.
//
// Deliberate simplification given real scale: the hotel has 89 rooms total. Rather than building
// a Firestore query with a where() per possible criterion (which would need a composite index for
// nearly every combination staff might ask about), this fetches the full `rooms` collection and
// filters in plain application code. Still fully deterministic — just simpler and index-free at
// this size. Revisit only if the room count grows by an order of magnitude.

import { Firestore } from "firebase-admin/firestore";
import { RoomRepository, RoomFilterCriteria } from "../../../domain/rooms/repositories/room-repository";
import { Room } from "../../../domain/rooms/entities/room";

export class FirestoreRoomRepository implements RoomRepository {
  constructor(private readonly db: Firestore) {}

  async findMatching(criteria: RoomFilterCriteria): Promise<Room[]> {
    const snapshot = await this.db.collection("rooms").get();
    const allRooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Room));
    return allRooms.filter((room) => matchesAllStatedCriteria(room, criteria));
  }
}

// Pure function, independent of Firestore — this is what tests/acceptance/room-matching.spec.ts
// should exercise directly, with no live database involved.
export function matchesAllStatedCriteria(room: Room, criteria: RoomFilterCriteria): boolean {
  if (criteria.bedCount !== undefined && room.bedConfiguration.bedCount !== criteria.bedCount) return false;
  if (criteria.bedType !== undefined && room.bedConfiguration.bedType !== criteria.bedType) return false;
  if (criteria.showerType !== undefined && room.showerType !== criteria.showerType) return false;
  if (criteria.bedClearance !== undefined && room.bedClearance !== criteria.bedClearance) return false;
  if (criteria.isAccessible !== undefined && room.isAccessible !== criteria.isAccessible) return false;
  if (criteria.hasKitchen !== undefined && room.hasKitchen !== criteria.hasKitchen) return false;
  if (criteria.hasPullOutSofaBed !== undefined && room.hasPullOutSofaBed !== criteria.hasPullOutSofaBed) return false;
  if (criteria.hasSofa !== undefined && room.hasSofa !== criteria.hasSofa) return false;
  if (criteria.hasCarpet !== undefined && room.hasCarpet !== criteria.hasCarpet) return false;
  if (criteria.view !== undefined && room.view !== criteria.view) return false;
  if (criteria.curtainType !== undefined && room.curtainType !== criteria.curtainType) return false;
  if (criteria.roomClass !== undefined && room.roomClass !== criteria.roomClass) return false;
  return true;
}
