// NOTE: Firestore has no native fuzzy/full-text search. This does exact category match and a
// simple "starts with" name match. If you need real fuzzy search later, that's an Algolia/
// Typesense integration living behind this same ContactRepository interface — not a rewrite.

import { Firestore } from "firebase-admin/firestore";
import { ContactRepository } from "../../../domain/contacts/repositories/contact-repository";
import { Contact, ContactCategory } from "../../../domain/contacts/entities/contact";

export class FirestoreContactRepository implements ContactRepository {
  constructor(private readonly db: Firestore) {}

  async search(query: string): Promise<Contact[]> {
    const normalized = query.trim();
    const byCategory = await this.db.collection("contacts").where("category", "==", normalized).get();
    const byNamePrefix = await this.db
      .collection("contacts")
      .where("name", ">=", normalized)
      .where("name", "<=", normalized + "\uf8ff")
      .get();

    const results = new Map<string, Contact>();
    [...byCategory.docs, ...byNamePrefix.docs].forEach((doc) => {
      results.set(doc.id, { id: doc.id, ...doc.data() } as Contact);
    });
    return Array.from(results.values());
  }
  async findByCategory(category: ContactCategory): Promise<Contact[]>{
    const byCategory = await this.db.collection("contacts").where("category", "==", category).get();
    const results = new Map<string, Contact>();
    [...byCategory.docs].forEach((doc) => {
      results.set(doc.id, { id: doc.id, ...doc.data() } as Contact);
    });
    return Array.from(results.values());

  }
  async findById(id: string): Promise<Contact | null>{
    const normalized = id.trim();
    const docSnap = await this.db.collection("contacts").doc(normalized).get();
    if (docSnap.exists){
      return docSnap.id, docSnap.data() as Contact
    } else{
      return null
    }

  }

  async findAll(): Promise<Contact[]> {
    const snapshot = await this.db.collection("contacts").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data()} as Contact));
  }

  async create(contact: Omit<Contact, "id">): Promise<Contact> {
    const ref = await this.db.collection("contacts").add(contact);
    return {id: ref.id,...contact};
  }

  async update(id: string,patch: Partial<Omit<Contact, "id">>): Promise<Contact> {
    await this.db.collection("contacts").doc(id).update(patch);
    const doc = await this.db.collection("contacts").doc(id).get();
    return {id: doc.id, ...doc.data()} as Contact
  }

  async delete(id: string):Promise<void>{
    await this.db.collection("contacts").doc(id).delete();
  }
}
