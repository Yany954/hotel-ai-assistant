import { Contact, ContactCategory } from "../entities/contact";

export interface ContactRepository {
  search(query: string): Promise<Contact[]>;
  findByCategory(category: ContactCategory): Promise<Contact[]>;
  findById(id: string): Promise<Contact | null>;
  findAll(): Promise<Contact[]>;
  create(contact: Omit<Contact, "id">): Promise<Contact>;
  update(id: string,patch: Partial<Omit<Contact, "id">>): Promise<Contact>;
  delete(id: string): Promise<void>;
}
