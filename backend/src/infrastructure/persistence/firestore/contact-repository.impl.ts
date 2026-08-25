// NOTE: Firestore has no native fuzzy/full-text search, so — same pattern as the room repository
// at this hotel's scale — this fetches the full `contacts` collection and matches in application
// code. This used to query a Firestore field called "name" for a prefix match, but the entity
// field is actually `organizationName`, so that query could never match any document; it also
// only matched if the ENTIRE staff message was an exact prefix of the org name, which is backwards
// from what we actually want (does the org name appear somewhere IN the staff's message).

import { Firestore } from "firebase-admin/firestore";
import { ContactRepository } from "../../../domain/contacts/repositories/contact-repository";
import { Contact, ContactCategory } from "../../../domain/contacts/entities/contact";

const STOP_WORDS = new Set([
  "number", "phone", "call", "the", "for", "need", "a", "an", "i", "to", "whats", "what's",
  "is", "of", "contact", "get", "me", "please", "can", "you", "give",
]);

export class FirestoreContactRepository implements ContactRepository {
  constructor(private readonly db: Firestore) {}

  async search(query: string): Promise<Contact[]> {
  const normalizedQuery = query.trim().toLowerCase();
  const snapshot = await this.db.collection("contacts").get();
  const allContacts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Contact));

  const queryWords = normalizedQuery.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  return allContacts.filter((c) => {
    const name = (c.organizationName ?? "").toLowerCase();
    if (!name) return false;
    const category = (c.category ?? "").replace(/_/g, " ").toLowerCase();
    if (normalizedQuery.includes(name) || name.includes(normalizedQuery) || normalizedQuery.includes(category)) {
      return true;
    }
    const nameWords = name.split(/[^a-z0-9]+/);
    return queryWords.some((qw) => nameWords.some((nw) => nw === qw || nw.startsWith(qw) || qw.startsWith(nw)));
  });
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