// Mirrors backend/src/domain/rooms/entities/room.ts and its value-objects. Same note as
// contact.ts re: keeping these two copies in sync.

export interface BedConfiguration {
  bedCount: number;
  bedType: "queen" | "king";
}

export type ShowerType = "walk_in_shower" | "bathtub" | "tub_shower_combo";
export type BedClearance = "flush_to_floor" | "gap_underneath";
export type RoomView = "street_facing" | "parking_lot_facing";
export type RoomClass = "suite" | "regular";
export type ChairType = "none" | "chair" | "mini-sofa";

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  roomTypeCode?: string;
  bedConfiguration: BedConfiguration;
  showerType: ShowerType;
  bedClearance: BedClearance;
  isAccessible: boolean;
  hasKitchen: boolean;
  hasPullOutSofaBed: boolean;
  chairType: ChairType;
  hasCarpet: boolean;
  view: RoomView;
  roomClass: RoomClass;
  connectingRoomNumber?: string;
  hasConnectingRoom?: boolean;
}

export type RoomDraft = Omit<Room, "id"> & { id: string | null };
