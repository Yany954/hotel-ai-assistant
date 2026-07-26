import { ContactRepository } from "../../domain/contacts/repositories/contact-repository";

export class LookupContact {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(query: string) {
    return this.contactRepository.search(query);
  }
}
