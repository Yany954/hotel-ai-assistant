// Port (interface only). The domain defines WHAT it needs; infrastructure decides HOW.
// Every field is optional — only the constraints the guest actually stated get applied
// (see docs/requirements/room-matching.md, acceptance criterion 3).

import { Room } from "../entities/room";
import { ShowerType } from "../value-objects/shower-type";
import { BedClearance } from "../value-objects/bed-clearance";
import { RoomView } from "../value-objects/room-view";
import { RoomClass } from "../value-objects/room-class";
import { ChairType } from "../value-objects/chair-type";

export interface RoomFilterCriteria {
  bedCount?: number;
  bedType?: "queen" | "king";
  showerType?: ShowerType;
  bedClearance?: BedClearance;
  isAccessible?: boolean;
  hasKitchen?: boolean;
  hasPullOutSofaBed?: boolean;
  chairType?: ChairType;
  hasCarpet?: boolean;
  view?: RoomView;
  roomClass?: RoomClass;
  connectingRoomNumber?: string;
  hasConnectingRoom?: boolean;
}

export interface RoomRepository {
  findMatching(criteria: RoomFilterCriteria): Promise<Room[]>;
  findAll(): Promise<Room[]>;
  create(room: Omit<Room, "id">): Promise<Room>;
  bulkCreate(rooms: Omit<Room, "id">[]): Promise<Room[]>;
  update(id: string, patch: Partial<Omit<Room, "id">>): Promise<Room>;
  delete(id: string): Promise<void>;
}
