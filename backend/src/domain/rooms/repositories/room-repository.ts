// Port (interface only). The domain defines WHAT it needs; infrastructure decides HOW.
// Every field is optional — only the constraints the guest actually stated get applied
// (see docs/requirements/room-matching.md, acceptance criterion 3).

import { Room } from "../entities/room";
import { ShowerType } from "../value-objects/shower-type";
import { BedClearance } from "../value-objects/bed-clearance";
import { RoomView } from "../value-objects/room-view";
import { CurtainType } from "../value-objects/curtain-type";
import { RoomClass } from "../value-objects/room-class";

export interface RoomFilterCriteria {
  bedCount?: number;
  bedType?: "queen" | "king";
  showerType?: ShowerType;
  bedClearance?: BedClearance;
  isAccessible?: boolean;
  hasKitchen?: boolean;
  hasPullOutSofaBed?: boolean;
  hasSofa?: boolean;
  hasCarpet?: boolean;
  view?: RoomView;
  curtainType?: CurtainType;
  roomClass?: RoomClass;
}

export interface RoomRepository {
  findMatching(criteria: RoomFilterCriteria): Promise<Room[]>;
}
