import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { MockAuth } from '../../../core/auth/mock-auth';
import { EventDetail, Ticket, TicketType } from '../../../data-access/models';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { TicketsRepository } from '../../../data-access/repositories/tickets-repository';
import { formatDateEsVe } from '../../../shared/formatting/formatters';
import { createAsyncPageState } from '../../../shared/state/async-page-state';
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
  private readonly pageState = createAsyncPageState();

  protected readonly labels = appLabels;
  protected readonly loading = this.pageState.loading;
  protected readonly errorMessage = this.pageState.errorMessage;
  protected readonly notFound = this.pageState.notFound;
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

    return formatDateEsVe(value, {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  }

  protected retryLoad(): void {
    const ticketId = this.routeParams()?.get('ticketId');

    if (ticketId) {
      void this.loadTicket(ticketId, this.auth.currentUser().id);
    }
  }

  private async loadTicket(ticketId: string, userId: string): Promise<void> {
    const requestId = this.pageState.start();

    try {
      const ticket = await this.ticketsRepository.getTicketById(ticketId, userId);

      if (!this.pageState.isCurrent(requestId)) {
        return;
      }

      this.ticket.set(ticket);

      if (!ticket) {
        this.eventDetail.set(null);
        this.pageState.setNotFound(requestId);
        return;
      }

      const eventDetail = await this.eventsRepository.getEventById(ticket.eventId);

      if (this.pageState.isCurrent(requestId)) {
        this.eventDetail.set(eventDetail);
      }
    } catch {
      if (this.pageState.isCurrent(requestId)) {
        this.ticket.set(null);
        this.eventDetail.set(null);
        this.pageState.setError(requestId, this.labels.ticketDetail.errorDescription);
      }
    } finally {
      this.pageState.finish(requestId);
    }
  }
}
