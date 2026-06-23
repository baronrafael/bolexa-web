import { inject, Injectable } from '@angular/core';
import { Ticket } from '../models';
import { MockDatabase } from '../mock/mock-database';
import { clone, mockDelay } from '../mock/mock-helpers';

@Injectable({
  providedIn: 'root',
})
export class TicketsRepository {
  private readonly database = inject(MockDatabase);

  async listMyTickets(userId: string): Promise<Ticket[]> {
    await mockDelay();

    return this.database
      .snapshot()
      .tickets
      .filter((ticket) => ticket.userId === userId)
      .map((ticket) => clone(ticket));
  }

  async getTicketById(ticketId: string, userId?: string): Promise<Ticket | null> {
    await mockDelay();

    const ticket = this.database
      .snapshot()
      .tickets
      .find((candidate) => candidate.id === ticketId && (!userId || candidate.userId === userId));

    return ticket ? clone(ticket) : null;
  }
}
