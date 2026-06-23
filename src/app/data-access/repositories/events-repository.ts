import { inject, Injectable } from '@angular/core';
import { Event, EventDetail, EventFilters, TicketType } from '../models';
import { MockDatabase } from '../mock/mock-database';
import { clone, mockDelay } from '../mock/mock-helpers';

@Injectable({
  providedIn: 'root',
})
export class EventsRepository {
  private readonly database = inject(MockDatabase);

  async listEvents(filters: EventFilters = {}): Promise<EventDetail[]> {
    await mockDelay();

    const state = this.database.snapshot();
    const query = filters.query?.trim().toLowerCase();

    const events = state.events
      .filter((event) => event.status === 'published')
      .filter((event) => !filters.category || event.category === filters.category)
      .filter((event) => {
        const venue = state.venues.find((candidate) => candidate.id === event.venueId);

        return !filters.city || venue?.city === filters.city;
      })
      .filter((event) => !query || `${event.title} ${event.description}`.toLowerCase().includes(query))
      .sort((first, second) => first.startsAt.localeCompare(second.startsAt));

    return events.map((event) => this.toEventDetail(event));
  }

  async getFeaturedEvents(limit = 3): Promise<EventDetail[]> {
    const events = await this.listEvents();

    return events.slice(0, limit);
  }

  async getEventBySlug(slug: string): Promise<EventDetail | null> {
    await mockDelay();

    const event = this.database.snapshot().events.find((candidate) => candidate.slug === slug);

    return event ? this.toEventDetail(event) : null;
  }

  async getEventById(eventId: string): Promise<EventDetail | null> {
    await mockDelay();

    const event = this.database.snapshot().events.find((candidate) => candidate.id === eventId);

    return event ? this.toEventDetail(event) : null;
  }

  async getTicketTypes(eventId: string): Promise<TicketType[]> {
    await mockDelay();

    return this.database
      .snapshot()
      .ticketTypes
      .filter((ticketType) => ticketType.eventId === eventId)
      .map((ticketType) => clone(ticketType));
  }

  private toEventDetail(event: Event): EventDetail {
    const state = this.database.snapshot();
    const organizer = state.organizers.find((candidate) => candidate.id === event.organizerId);
    const venue = state.venues.find((candidate) => candidate.id === event.venueId);
    const ticketTypes = state.ticketTypes.filter((ticketType) => ticketType.eventId === event.id);

    if (!organizer || !venue) {
      throw new Error(`Mock event ${event.id} has invalid relationships.`);
    }

    return clone({ event, organizer, venue, ticketTypes });
  }
}
