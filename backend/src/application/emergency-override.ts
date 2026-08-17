// backend/src/application/emergency-override.ts
const EMERGENCY_KEYWORDS = [
  "atrapado", "atrapada", "trapped", "incendio", "fuego", "fire",
  "herido", "herida", "injured", "sangre", "blood", "no respira",
  "not breathing", "emergencia médica", "medical emergency",
];
export function isEmergency(text: string): boolean {
  const normalized = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => normalized.includes(kw));
}