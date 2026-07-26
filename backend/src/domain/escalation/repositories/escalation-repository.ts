import { EscalationProcedure } from "../entities/escalation-procedure";

export interface EscalationRepository {
  // triggerSituation must come from a closed set the classifier maps free text into —
  // never an arbitrary string the LLM invents.
  findBySituation(triggerSituation: string): Promise<EscalationProcedure | null>;
}
