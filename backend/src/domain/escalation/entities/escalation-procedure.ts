// backend/src/domain/escalation/entities/escalation-procedure.ts
export interface EscalationStep {
  order: number;
  condition?: string;
  contactId?: string;
  instructions: string;
  isEmergency: boolean;
}

export interface EscalationProcedure {
  id: string;
  triggerSituation: string;  // título corto, ej. "late_checkout_policy"
  content: string;           // el texto completo del procedimiento — esto es lo que se embebe y se le da al LLM como contexto
  category: string;          // "front_desk_policy" | "maintenance_howto" | "shift_training" | "vip_guest_info" | "third_party_escalation" — libre, no un enum estricto, tu contenido es muy variado
  steps?: EscalationStep[];  // opcional — solo para los pocos casos con ramificación real a un contacto (elevador, incendio)
}
