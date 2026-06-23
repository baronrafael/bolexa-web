import { inject, Injectable } from '@angular/core';
import { Attendee, EventDetail, Order, OrganizerDashboardSummary } from '../models';
import { MockDatabase } from '../mock/mock-database';
import { clone, mockDelay } from '../mock/mock-helpers';

@Injectable({
  providedIn: 'root',
})
export class OrganizerRepository {
  private readonly database = inject(MockDatabase);

  async getDashboard(organizerId: string): Promise<OrganizerDashboardSummary> {
    await mockDelay();

    const events = this.listEventDetailsForOrganizer(organizerId);
    const eventIds = new Set(events.map((detail) => detail.event.id));
    const state = this.database.snapshot();
    const paidOrders = state.orders.filter((order) => eventIds.has(order.eventId) && order.status === 'paid');
    const checkIns = state.checkIns.filter((checkIn) => eventIds.has(checkIn.eventId) && checkIn.status === 'accepted');

    return clone({
      totalRevenue: paidOrders.reduce((total, order) => total + order.total, 0),
      ticketsSold: state.tickets.filter((ticket) => eventIds.has(ticket.eventId)).length,
      checkIns: checkIns.length,
      upcomingEvents: events.slice(0, 4),
      recentOrders: paidOrders.sort((first, second) => second.createdAt.localeCompare(first.createdAt)).slice(0, 5),
    });
  }

  async listEvents(organizerId: string): Promise<EventDetail[]> {
    await mockDelay();

    return clone(this.listEventDetailsForOrganizer(organizerId));
  }

  async listOrders(eventId: string): Promise<Order[]> {
    await mockDelay();

    return this.database
      .snapshot()
      .orders
      .filter((order) => order.eventId === eventId)
      .map((order) => clone(order));
  }

  async listAttendees(eventId: string): Promise<Attendee[]> {
    await mockDelay();

    const state = this.database.snapshot();

    return state.tickets
      .filter((ticket) => ticket.eventId === eventId)
      .map((ticket) => {
        const ticketType = state.ticketTypes.find((candidate) => candidate.id === ticket.ticketTypeId);
        const order = state.orders.find((candidate) => candidate.id === ticket.orderId);
        const user = state.users.find((candidate) => candidate.id === ticket.userId);

        if (!ticketType || !order || !user) {
          throw new Error(`Mock attendee ${ticket.id} has invalid relationships.`);
        }

        return clone({ ticket, ticketType, order, user });
      });
  }

  private listEventDetailsForOrganizer(organizerId: string): EventDetail[] {
    const state = this.database.snapshot();
    const organizer = state.organizers.find((candidate) => candidate.id === organizerId);

    if (!organizer) {
      return [];
    }

    return state.events
      .filter((event) => event.organizerId === organizerId)
      .map((event) => {
        const venue = state.venues.find((candidate) => candidate.id === event.venueId);

        if (!venue) {
          throw new Error(`Mock event ${event.id} has invalid venue.`);
        }

        return clone({
          event,
          organizer,
          venue,
          ticketTypes: state.ticketTypes.filter((ticketType) => ticketType.eventId === event.id),
        });
      });
  }
}
