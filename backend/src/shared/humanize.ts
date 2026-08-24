// Pure formatting helpers — turn our closed-set domain codes (e.g. "walk_in_shower") into
// plain English staff can read comfortably. No business logic here, just presentation.

export function describeShowerType(type: string): string {
  switch (type) {
    case "walk_in_shower":
      return "walk-in shower (step right in, no tub to climb over)";
    case "bathtub":
      return "bathtub only";
    case "tub_shower_combo":
      return "shower/tub combo";
    default:
      return type.replace(/_/g, " ");
  }
}

interface RoomLike {
  roomNumber: string;
  floor: number;
  bedConfiguration: { bedCount: number; bedType: string };
  showerType: string;
  hasKitchen: boolean;
  isAccessible: boolean;
  view: string;
  roomClass: string;
  connectingRoomNumber?: string;
  hasConnectingRoom?: boolean;
  
}

export function describeRoom(r: RoomLike): string {
  const parts = [
    `${r.bedConfiguration.bedCount} ${r.bedConfiguration.bedType} bed${r.bedConfiguration.bedCount > 1 ? "s" : ""}`,
    describeShowerType(r.showerType),
  ];
  if (r.hasKitchen) parts.push("has a kitchen");
  if (r.isAccessible) parts.push("ADA-accessible");
  if (r.roomClass === "suite") parts.push("suite");
  parts.push(r.view === "street_facing" ? "street-facing" : "facing the parking lot");
  return `Room ${r.roomNumber}: ${parts.join(", ")}.`;
}

interface ContactLike {
  organizationName: string;
  phoneLines: Array<{ purpose: string; phoneNumber: string; contactPersonName?: string }>;
  notes?: string;
}

// Deliberately NOT an AI call — the proposal calls this domain tool "structured lookup (not AI)"
// so answers stay 100% deterministic. This just makes the deterministic answer read naturally.
export function describeContacts(contacts: ContactLike[], query: string): string {
  if (contacts.length === 0) {
    return `I couldn't find a contact matching "${query}". Try the vendor name (e.g. "elevator", "Wyndham", "wifi") or ask an admin to add it to the directory.`;
  }
  const lines = contacts.map((c) => {
    const phones = c.phoneLines
      .map((p) => `${p.purpose ? `${p.purpose.replace(/_/g, " ")}: ` : ""}${p.phoneNumber}${p.contactPersonName ? ` (ask for ${p.contactPersonName})` : ""}`)
      .join(" · ");
    return `- **${c.organizationName}** — ${phones}${c.notes ? `\n  _${c.notes}_` : ""}`;
  });
  return lines.join("\n");
}