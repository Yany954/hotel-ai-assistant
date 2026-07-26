// Domain entity for the "contacts directory" bounded context.
// A Contact is an organization/vendor/service — NOT a step-by-step procedure. For conditional,
// multi-step situations (e.g. elevator down -> reset 3x -> still failing -> call TK, OR guest
// trapped -> call fire dept immediately), see ../../escalation/ instead. Contact only answers
// "what's the number for X", never "what do I do in situation Y".

import { PhoneLine } from "../value-objects/phone-line";

export type ContactCategory =
  | "tech_support"
  | "third_party_platform"
  | "property_management_company"
  | "reservation_platform"
  | "internal_staff"
  | "sister_hotel"
  | "vendor_supply"
  | "phone_system_vendor"
  | "elevator_service"
  | "maintenance_emergency"
  | "safety_security"
  | "emergency_services"; // handled with extra care — see escalation bounded context

export interface Contact {
  id: string;
  organizationName: string;   // e.g. "CLC", "Tech Guru", "Southern Glazer's"
  category: ContactCategory;
  accountNumber?: string;      // optional — e.g. Coke A/C No, Hotel Engine account, Golden Malted A/C
  phoneLines: PhoneLine[];     // always at least 1; several for orgs like CLC
  notes?: string;
  updatedBy: string;
  updatedAt: string;
}
