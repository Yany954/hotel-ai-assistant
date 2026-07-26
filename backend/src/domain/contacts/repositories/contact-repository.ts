import { Contact, ContactCategory } from "../entities/contact";

export interface ContactRepository {
  search(query: string): Promise<Contact[]>;
  findByCategory(category: ContactCategory): Promise<Contact[]>;
  findById(id: string): Promise<Contact | null>;
}
