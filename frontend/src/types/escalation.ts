export interface EscalationStep {
  order: number;
  condition?: string;
  contactId?: string;
  instructions: string;
  isEmergency: boolean;
}
export interface EscalationProcedure {
  id: string;
  triggerSituation: string;
  content: string;
  category: string;
  steps?: EscalationStep[];
}
export type EscalationProcedureDraft = Omit<EscalationProcedure, "id"> & { id: string | null };