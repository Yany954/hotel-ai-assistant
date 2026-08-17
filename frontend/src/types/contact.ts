// Mirrors backend/src/domain/contacts/entities/contact.ts and value-objects/phone-line.ts.
// Kept as a plain duplicate for now since frontend and backend are separate packages — if this
// drifts out of sync often, consider a shared `packages/shared-types` workspace later.

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
  | "emergency_services";

export interface PhoneLine {
  purpose: string;
  phoneNumber: string;
  contactPersonName?: string;
}

export interface Contact {
  id: string;
  organizationName: string;
  category: ContactCategory;
  accountNumber?: string;
  phoneLines: PhoneLine[];
  notes?: string;
}

export type ContactDraft = Omit<Contact, "id"> & { id: string | null };
