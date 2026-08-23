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
  async findAll(): Promise<Room[]> {
    const snapshot = await this.db.collection("rooms").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Room));
  }

  async create(room: Omit<Room, "id">): Promise<Room> {
    const ref = await this.db.collection("rooms").add(room);
    return { id: ref.id, ...room };
  }

  async bulkCreate(rooms: Omit<Room, "id">[]): Promise<Room[]> {
    const batch = this.db.batch();
    const refs = rooms.map((room) => {
      const ref = this.db.collection("rooms").doc();
      batch.set(ref, room);
      return ref;
    });
    await batch.commit();
    return refs.map((ref, i) => ({ id: ref.id, ...rooms[i] }));
  }

  async update(id: string, patch: Partial<Omit<Room, "id">>): Promise<Room> {
    const roomRef = this.db.collection("rooms").doc(id)
    await roomRef.update(patch)
    const snapshot = await roomRef.get()
    return {id: snapshot.id, ...snapshot.data()} as Room

  }
  async delete(id: string): Promise<void> {
    const roomRef = await this.db.collection("rooms").doc(id).delete()
    console.log("Room deleted")
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
  if (criteria.roomClass !== undefined && room.roomClass !== criteria.roomClass) return false;
  return true;
}
