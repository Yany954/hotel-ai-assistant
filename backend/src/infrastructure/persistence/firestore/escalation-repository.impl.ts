import { Firestore, FieldValue } from "firebase-admin/firestore";
import { EscalationRepository } from "../../../domain/escalation/repositories/escalation-repository";
import { EscalationProcedure } from "../../../domain/escalation/entities/escalation-procedure";
import { EmbeddingClient } from "../../../application/ports/embedding-client";

export class FirestoreEscalationRepository implements EscalationRepository {
  constructor(private readonly db: Firestore, private readonly embeddingClient: EmbeddingClient) {}

  async findAll(): Promise<EscalationProcedure[]> {
    const snapshot = await this.db.collection("procedures").get();
    return snapshot.docs.map((doc) => this.toDomain(doc));
  }

  async create(procedure: Omit<EscalationProcedure, "id">): Promise<EscalationProcedure> {
    const embedding = await this.embeddingClient.embed(procedure.content);
    const ref = await this.db.collection("procedures").add({
      ...procedure,
      contentEmbedding: FieldValue.vector(embedding),
    });
    return { id: ref.id, ...procedure };
  }


  async update(id: string, patch: Partial<Omit<EscalationProcedure, "id">>): Promise<EscalationProcedure> {
    const updateData: Record<string, unknown> = { ...patch };
    if (patch.content) {
      updateData.contentEmbedding = FieldValue.vector(await this.embeddingClient.embed(patch.content));
    }
    await this.db.collection("procedures").doc(id).update(updateData);
    const doc = await this.db.collection("procedures").doc(id).get();
    return this.toDomain(doc as FirebaseFirestore.QueryDocumentSnapshot);
  }


  async delete(id: string): Promise<void> {
    await this.db.collection("procedures").doc(id).delete();
  }

   async findByEmbedding(queryEmbedding: number[], limit = 3): Promise<EscalationProcedure[]> {
    const vectorQuery = this.db.collection("procedures").findNearest({
      vectorField: "contentEmbedding",
      queryVector: queryEmbedding,
      limit,
      distanceMeasure: "COSINE",
    });
    const snapshot = await vectorQuery.get();
    return snapshot.docs.map((doc) => this.toDomain(doc));
  }

  private toDomain(doc: FirebaseFirestore.QueryDocumentSnapshot): EscalationProcedure {
    const data = doc.data();
    return {
      id: doc.id,
      triggerSituation: data.triggerSituation,
      content: data.content,
      category: data.category,
      steps: data.steps ?? [],
    };
  }
}