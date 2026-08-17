import { Contact, ContactCategory, ContactDraft, PhoneLine } from "../types/contact";

export const CONTACT_CATEGORIES : ContactCategory[] = [
  "tech_support", "third_party_platform", "property_management_company",
  "reservation_platform", "internal_staff", "sister_hotel", "vendor_supply",
  "phone_system_vendor", "elevator_service", "maintenance_emergency",
  "safety_security", "emergency_services",
];

export const CATEGORY_LABELS :Record<ContactCategory, string> = {
  tech_support: "Soporte técnico",
  third_party_platform: "Plataforma externa",
  property_management_company: "Empresa administradora",
  reservation_platform: "Plataforma de reservas",
  internal_staff: "Personal interno",
  sister_hotel: "Hotel aliado",
  vendor_supply: "Proveedor",
  phone_system_vendor: "Proveedor de telefonía",
  elevator_service: "Servicio de ascensor",
  maintenance_emergency: "Mantenimiento urgente",
  safety_security: "Seguridad",
  emergency_services: "Emergencias",
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