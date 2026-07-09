import { inject, Injectable } from '@angular/core';
import { EventDetail, Ticket } from '../models';
import { MockDatabase } from '../mock/mock-database';
import { clone, mockDelay } from '../mock/mock-helpers';

export interface TicketListItemReadModel {
  ticket: Ticket;
  eventDetail: EventDetail | null;
  ticketTypeName: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TicketsRepository {
  private readonly database = inject(MockDatabase);

  async listMyTicketItems(userId: string): Promise<TicketListItemReadModel[]> {
    await mockDelay();

    const state = this.database.snapshot();
    const tickets = state.tickets.filter((ticket) => ticket.userId === userId);

    return tickets
      .map((ticket) => {
        const event = state.events.find((candidate) => candidate.id === ticket.eventId);
        const venue = event
          ? state.venues.find((candidate) => candidate.id === event.venueId)
          : undefined;
        const organizer = event
          ? state.organizers.find((candidate) => candidate.id === event.organizerId)
          : undefined;
        const ticketTypes = state.ticketTypes.filter(
          (ticketType) => ticketType.eventId === ticket.eventId,
        );
        const ticketTypeName = ticketTypes.find(
          (ticketType) => ticketType.id === ticket.ticketTypeId,
        )?.name;
        const eventDetail =
          event && venue && organizer ? { event, venue, organizer, ticketTypes } : null;

        return clone({
          ticket,
          eventDetail,
          ticketTypeName: ticketTypeName ?? null,
        });
      })
      .sort((first, second) => this.sortByEventDate(first, second));
  }

  async getTicketById(ticketId: string, userId?: string): Promise<Ticket | null> {
    await mockDelay();

    const ticket = this.database
      .snapshot()
      .tickets.find(
        (candidate) => candidate.id === ticketId && (!userId || candidate.userId === userId),
      );

    return ticket ? clone(ticket) : null;
  }

  private sortByEventDate(first: TicketListItemReadModel, second: TicketListItemReadModel): number {
    const firstTime = first.eventDetail?.event.startsAt
      ? new Date(first.eventDetail.event.startsAt).getTime()
      : Number.MAX_SAFE_INTEGER;
    const secondTime = second.eventDetail?.event.startsAt
      ? new Date(second.eventDetail.event.startsAt).getTime()
      : Number.MAX_SAFE_INTEGER;

    return firstTime - secondTime;
  }
}
