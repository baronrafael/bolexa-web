import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { MockAuth } from '../../../core/auth/mock-auth';
import { EventDetail, Ticket, TicketType } from '../../../data-access/models';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { TicketsRepository } from '../../../data-access/repositories/tickets-repository';
import { EmptyState, LoadingState, QrTicketCard, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-ticket-detail',
  imports: [EmptyState, LoadingState, QrTicketCard, RouterLink, StatusBadge],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(MockAuth);
  private readonly ticketsRepository = inject(TicketsRepository);
  private readonly eventsRepository = inject(EventsRepository);
  private readonly routeParams = toSignal(this.route.paramMap);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly ticket = signal<Ticket | null>(null);
  protected readonly eventDetail = signal<EventDetail | null>(null);
  protected readonly ticketType = computed<TicketType | undefined>(() => {
    const currentTicket = this.ticket();

    return currentTicket
      ? this.eventDetail()?.ticketTypes.find((ticketType) => ticketType.id === currentTicket.ticketTypeId)
      : undefined;
  });

  constructor() {
    effect(() => {
      const ticketId = this.routeParams()?.get('ticketId');
      const userId = this.auth.currentUser().id;

      if (ticketId) {
        void this.loadTicket(ticketId, userId);
      }
    });
  }

  protected formatDate(value?: string): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  private async loadTicket(ticketId: string, userId: string): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);

    try {
      const ticket = await this.ticketsRepository.getTicketById(ticketId, userId);

      if (requestId !== this.loadRequestId) {
        return;
      }

      this.ticket.set(ticket);

      if (!ticket) {
        this.eventDetail.set(null);
        return;
      }

      const eventDetail = await this.eventsRepository.getEventById(ticket.eventId);

      if (requestId === this.loadRequestId) {
        this.eventDetail.set(eventDetail);
      }
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }
}
