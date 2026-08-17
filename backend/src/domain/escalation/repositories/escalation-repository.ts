import { EscalationProcedure } from "../entities/escalation-procedure";

export interface EscalationRepository {
  findAll(): Promise<EscalationProcedure[]>;
  create(procedure: Omit<EscalationProcedure, "id">): Promise<EscalationProcedure>; // el embedding ahora se genera de procedure.content, no de un string aparte
  update(id: string, patch: Partial<Omit<EscalationProcedure, "id">>): Promise<EscalationProcedure>;
  delete(id: string): Promise<void>;
  findByEmbedding(queryEmbedding: number[], limit?: number): Promise<EscalationProcedure[]>;
}