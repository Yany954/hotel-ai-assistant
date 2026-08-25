import { Contact, ContactCategory } from "../types/contact";

export const CONTACT_CATEGORIES : ContactCategory[] = [
  "tech_support", "third_party_platform", "property_management_company",
  "reservation_platform", "internal_staff", "sister_hotel", "vendor_supply",
  "phone_system_vendor", "elevator_service", "maintenance_emergency",
  "safety_security", "emergency_services",
];

export const CATEGORY_LABELS :Record<ContactCategory, string> = {
  tech_support: "Technical Support",
  third_party_platform: "Third-Party Platform",
  property_management_company: "Property Management Company",
  reservation_platform: "Reservation Platform",
  internal_staff: "Internal Staff",
  sister_hotel: "Sister Hotel",
  vendor_supply: "Vendor",
  phone_system_vendor: "Phone System Vendor",
  elevator_service: "Elevator Service",
  maintenance_emergency: "Maintenance Emergency",
  safety_security: "Safety & Security",
  emergency_services: "Emergency Services",
};

export const initialContacts : Contact[] = [
  {
    id: "c1", organizationName: "Tech Guru", category: "tech_support", accountNumber: "",
    phoneLines: [{ purpose: "wifi_internet", phoneNumber: "(888) 247-5749" }],
    notes: "",
  },
  {
    id: "c2", organizationName: "CLC", category: "property_management_company", accountNumber: "",
    phoneLines: [
      { purpose: "accounting", phoneNumber: "844-271-5653" },
      { purpose: "after_hours", phoneNumber: "800-294-7682" },
      { purpose: "main", phoneNumber: "316-636-5055" },
    ],
    notes: "",
  },
  {
    id: "c3", organizationName: "TK Elevators", category: "elevator_service", accountNumber: "",
    phoneLines: [{ purpose: "service_call", phoneNumber: "" }],
    notes: "Solo llamar tras 3 intentos de reinicio fallidos. Si el huésped está atrapado, llamar a bomberos primero.",
  },
];