// Domain entity — no framework, no DB, no LLM dependencies (Clean Architecture: domain has zero
// outward dependencies). This is the ubiquitous language for the "room matching" bounded context.
//
// roomTypeCode is optional and purely for staff familiarity / fast admin data entry (the hotel
// already uses internal codes like "PNK1", "NDD29" that bundle several of these attributes).
// It is NEVER used for matching — matching always runs against the individual typed fields below,
// so a guest's request always maps to an explicit, auditable set of filters.

import { BedConfiguration } from "../value-objects/bed-configuration";
import { ShowerType } from "../value-objects/shower-type";
import { BedClearance } from "../value-objects/bed-clearance";
import { RoomView } from "../value-objects/room-view";
import { RoomClass } from "../value-objects/room-class";
import { ChairType } from "../value-objects/chair-type";

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
