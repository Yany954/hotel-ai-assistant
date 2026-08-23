import { Room } from "../types/room";
export const initialRooms: Room[] = [
  {
    id: "r1", roomNumber: "101", floor: 1, roomTypeCode: "PNK1",
    bedConfiguration: { bedCount: 1, bedType: "king" }, showerType: "walk_in_shower",
    bedClearance: "gap_underneath", isAccessible: true, hasKitchen: false,
    hasPullOutSofaBed: false, hasSofa: false, hasCarpet: false,
    view: "parking_lot_facing", roomClass: "regular",
  },
  {
    id: "r2", roomNumber: "214", floor: 2, roomTypeCode: "PNQ2",
    bedConfiguration: { bedCount: 2, bedType: "queen" }, showerType: "bathtub",
    bedClearance: "flush_to_floor", isAccessible: true, hasKitchen: false,
    hasPullOutSofaBed: false, hasSofa: false, hasCarpet: true,
    view: "street_facing", roomClass: "regular",
  },
];
 
export const CSV_TEMPLATE_HEADER =
  "roomNumber,floor,roomTypeCode,bedCount,bedType,showerType,bedClearance,isAccessible,hasKitchen,hasPullOutSofaBed,hasSofa,hasCarpet,view,roomClass";