// Use case (application layer). Orchestrates domain + ports. Contains zero business rules of its
// own — those live in the domain entities/value-objects.

import { RoomRepository, RoomFilterCriteria } from "../../domain/rooms/repositories/room-repository";

export class FindMatchingRooms {
  constructor(private readonly roomRepository: RoomRepository) {}

  async execute(criteria: RoomFilterCriteria) {
    return this.roomRepository.findMatching(criteria);
  }
}
