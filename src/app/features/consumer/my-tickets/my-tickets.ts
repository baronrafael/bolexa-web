import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { MockAuth } from '../../../core/auth/mock-auth';
import { EventDetail, Ticket } from '../../../data-access/models';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { TicketsRepository } from '../../../data-access/repositories/tickets-repository';
import { formatDateEsVe } from '../../../shared/formatting/formatters';
import { EmptyState, LoadingState, StatusBadge } from '../../../shared/ui';

interface TicketListItem {
  ticket: Ticket;
  eventDetail: EventDetail | null;
  ticketTypeName: string;
}

@Component({
  selector: 'app-my-tickets',
  imports: [EmptyState, LoadingState, RouterLink, StatusBadge],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTickets {
  private readonly auth = inject(MockAuth);
  private readonly ticketsRepository = inject(TicketsRepository);
  private readonly eventsRepository = inject(EventsRepository);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly items = signal<TicketListItem[]>([]);
  protected readonly upcomingTickets = computed(() => this.items().filter((item) => this.isUpcomingValid(item)));
  protected readonly historicalTickets = computed(() => this.items().filter((item) => !this.isUpcomingValid(item)));

  constructor() {
    effect(() => {
      const userId = this.auth.currentUser().id;

      void this.loadTickets(userId);
    });
  }

  protected formatDate(value?: string): string {
    if (!value) {
      return this.labels.myTickets.venueFallback;
    }

    return formatDateEsVe(value, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  protected eventVenue(item: TicketListItem): string {
    const detail = item.eventDetail;

    if (!detail) {
      return this.labels.myTickets.venueFallback;
    }

    return `${detail.venue.name} · ${detail.venue.city}`;
  }

  private async loadTickets(userId: string): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);

    try {
      const tickets = await this.ticketsRepository.listMyTickets(userId);
      const eventIds = [...new Set(tickets.map((ticket) => ticket.eventId))];
      const eventDetails = await Promise.all(eventIds.map((eventId) => this.eventsRepository.getEventById(eventId)));
      const detailsByEventId = new Map(eventIds.map((eventId, index) => [eventId, eventDetails[index]]));

      const items = tickets
        .map((ticket) => {
          const eventDetail = detailsByEventId.get(ticket.eventId) ?? null;
          const ticketTypeName = eventDetail?.ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name;

          return {
            ticket,
            eventDetail,
            ticketTypeName: ticketTypeName ?? this.labels.myTickets.ticketTypeFallback,
          };
        })
        .sort((first, second) => this.sortByEventDate(first, second));

      if (requestId === this.loadRequestId) {
        this.items.set(items);
      }
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }

  private isUpcomingValid(item: TicketListItem): boolean {
    const startsAt = item.eventDetail?.event.startsAt;

    return item.ticket.status === 'valid' && (!startsAt || new Date(startsAt).getTime() >= Date.now());
  }

  private sortByEventDate(first: TicketListItem, second: TicketListItem): number {
    const firstTime = first.eventDetail?.event.startsAt ? new Date(first.eventDetail.event.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
    const secondTime = second.eventDetail?.event.startsAt ? new Date(second.eventDetail.event.startsAt).getTime() : Number.MAX_SAFE_INTEGER;

    return firstTime - secondTime;
  }
}
