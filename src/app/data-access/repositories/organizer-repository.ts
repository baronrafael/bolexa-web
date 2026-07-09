import { inject, Injectable } from '@angular/core';
import {
  Attendee,
  Currency,
  Event,
  EventCategory,
  EventDetail,
  EventStatus,
  Order,
  OrderItem,
  OrganizerDashboardSummary,
  Ticket,
  TicketType,
  TicketTypeStatus,
  User,
  Venue,
} from '../models';
import { MockDatabase } from '../mock/mock-database';
import { clone, mockDelay } from '../mock/mock-helpers';

export interface SaveOrganizerEventInput {
  title: string;
  category: EventCategory;
  description: string;
  venueId: string;
  startsAt: string;
  coverImageUrl?: string;
  status: Extract<EventStatus, 'draft' | 'published'>;
}

export interface SaveTicketTypeInput {
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  quantityTotal: number;
  status: TicketTypeStatus;
}

export interface OrganizerOrder {
  order: Order;
  buyer: User;
  items: OrderItem[];
  tickets: Ticket[];
}

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
    const paidOrders = state.orders.filter(
      (order) => eventIds.has(order.eventId) && order.status === 'paid',
    );
    const checkIns = state.checkIns.filter(
      (checkIn) => eventIds.has(checkIn.eventId) && checkIn.status === 'accepted',
    );

    return clone({
      totalRevenue: paidOrders.reduce((total, order) => total + order.total, 0),
      ticketsSold: state.tickets.filter((ticket) => eventIds.has(ticket.eventId)).length,
      checkIns: checkIns.length,
      upcomingEvents: events.slice(0, 4),
      recentOrders: paidOrders
        .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
        .slice(0, 5),
    });
  }

  async listEvents(organizerId: string): Promise<EventDetail[]> {
    await mockDelay();

    return clone(this.listEventDetailsForOrganizer(organizerId));
  }

  async getEvent(organizerId: string, eventId: string): Promise<EventDetail | null> {
    await mockDelay();

    return clone(
      this.listEventDetailsForOrganizer(organizerId).find(
        (detail) => detail.event.id === eventId,
      ) ?? null,
    );
  }

  async listVenues(): Promise<Venue[]> {
    await mockDelay();

    return this.database.snapshot().venues.map((venue) => clone(venue));
  }

  async createEvent(organizerId: string, input: SaveOrganizerEventInput): Promise<EventDetail> {
    await mockDelay();

    const now = new Date().toISOString();
    const event: Event = {
      id: `event-${crypto.randomUUID()}`,
      organizerId,
      venueId: input.venueId,
      title: input.title,
      slug: this.slugify(input.title),
      description: input.description,
      category: input.category,
      coverImageUrl: input.coverImageUrl || undefined,
      startsAt: input.startsAt,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };

    this.database.update((state) => {
      state.events.push(event);
    });

    const createdEvent = await this.getEvent(organizerId, event.id);

    if (!createdEvent) {
      throw new Error(`Mock event ${event.id} was not created.`);
    }

    return createdEvent;
  }

  async updateEvent(
    organizerId: string,
    eventId: string,
    input: SaveOrganizerEventInput,
  ): Promise<EventDetail | null> {
    await mockDelay();

    this.database.update((state) => {
      const event = state.events.find(
        (candidate) => candidate.id === eventId && candidate.organizerId === organizerId,
      );

      if (!event) {
        return;
      }

      event.title = input.title;
      event.slug = this.slugify(input.title);
      event.description = input.description;
      event.category = input.category;
      event.venueId = input.venueId;
      event.startsAt = input.startsAt;
      event.coverImageUrl = input.coverImageUrl || undefined;
      event.status = input.status;
      event.updatedAt = new Date().toISOString();
    });

    return this.getEvent(organizerId, eventId);
  }

  async createTicketType(
    organizerId: string,
    eventId: string,
    input: SaveTicketTypeInput,
  ): Promise<EventDetail | null> {
    await mockDelay();

    if (!this.eventBelongsToOrganizer(organizerId, eventId)) {
      return null;
    }

    const now = new Date().toISOString();
    const ticketType: TicketType = {
      id: `ticket-type-${crypto.randomUUID()}`,
      eventId,
      name: input.name,
      description: input.description || undefined,
      price: input.price,
      currency: input.currency,
      quantityTotal: input.quantityTotal,
      quantitySold: 0,
      status: this.normalizeTicketTypeStatus(input.status, input.quantityTotal, 0),
      createdAt: now,
      updatedAt: now,
    };

    this.database.update((state) => {
      state.ticketTypes.push(ticketType);
    });

    return this.getEvent(organizerId, eventId);
  }

  async updateTicketType(
    organizerId: string,
    eventId: string,
    ticketTypeId: string,
    input: SaveTicketTypeInput,
  ): Promise<EventDetail | null> {
    await mockDelay();

    if (!this.eventBelongsToOrganizer(organizerId, eventId)) {
      return null;
    }

    this.database.update((state) => {
      const ticketType = state.ticketTypes.find(
        (candidate) => candidate.id === ticketTypeId && candidate.eventId === eventId,
      );

      if (!ticketType) {
        return;
      }

      ticketType.name = input.name;
      ticketType.description = input.description || undefined;
      ticketType.price = input.price;
      ticketType.currency = input.currency;
      ticketType.quantityTotal = Math.max(input.quantityTotal, ticketType.quantitySold);
      ticketType.status = this.normalizeTicketTypeStatus(
        input.status,
        ticketType.quantityTotal,
        ticketType.quantitySold,
      );
      ticketType.updatedAt = new Date().toISOString();
    });

    return this.getEvent(organizerId, eventId);
  }

  async listOrders(eventId: string): Promise<Order[]> {
    await mockDelay();

    return this.database
      .snapshot()
      .orders.filter((order) => order.eventId === eventId)
      .map((order) => clone(order));
  }

  async listEventOrders(organizerId: string, eventId: string): Promise<OrganizerOrder[]> {
    await mockDelay();

    if (!this.eventBelongsToOrganizer(organizerId, eventId)) {
      return [];
    }

    const state = this.database.snapshot();

    return state.orders
      .filter((order) => order.eventId === eventId)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
      .map((order) => {
        const buyer = state.users.find((user) => user.id === order.userId);

        if (!buyer) {
          throw new Error(`Mock order ${order.id} has invalid buyer.`);
        }

        return clone({
          order,
          buyer,
          items: state.orderItems.filter((item) => item.orderId === order.id),
          tickets: state.tickets.filter((ticket) => ticket.orderId === order.id),
        });
      });
  }

  async listAttendees(eventId: string): Promise<Attendee[]> {
    await mockDelay();

    return this.buildAttendees(eventId);
  }

  async listEventAttendees(organizerId: string, eventId: string): Promise<Attendee[]> {
    await mockDelay();

    if (!this.eventBelongsToOrganizer(organizerId, eventId)) {
      return [];
    }

    return this.buildAttendees(eventId);
  }

  private buildAttendees(eventId: string): Attendee[] {
    const state = this.database.snapshot();

    return state.tickets
      .filter((ticket) => ticket.eventId === eventId)
      .map((ticket) => {
        const ticketType = state.ticketTypes.find(
          (candidate) => candidate.id === ticket.ticketTypeId,
        );
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

  private eventBelongsToOrganizer(organizerId: string, eventId: string): boolean {
    return this.database
      .snapshot()
      .events.some((event) => event.id === eventId && event.organizerId === organizerId);
  }

  private normalizeTicketTypeStatus(
    status: TicketTypeStatus,
    quantityTotal: number,
    quantitySold: number,
  ): TicketTypeStatus {
    return quantitySold >= quantityTotal ? 'sold_out' : status;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
