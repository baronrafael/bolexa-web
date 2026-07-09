import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { MockAuth } from '../../../core/auth/mock-auth';
import {
  TicketsRepository,
  TicketListItemReadModel,
} from '../../../data-access/repositories/tickets-repository';
import { formatDateEsVe } from '../../../shared/formatting/formatters';
import { createAsyncPageState } from '../../../shared/state/async-page-state';
import { EmptyState, LoadingState, StatusBadge } from '../../../shared/ui';

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
  private readonly pageState = createAsyncPageState();

  protected readonly labels = appLabels;
  protected readonly loading = this.pageState.loading;
  protected readonly items = signal<TicketListItemReadModel[]>([]);
  protected readonly upcomingTickets = computed(() =>
    this.items().filter((item) => this.isUpcomingValid(item)),
  );
  protected readonly historicalTickets = computed(() =>
    this.items().filter((item) => !this.isUpcomingValid(item)),
  );

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

  protected eventVenue(item: TicketListItemReadModel): string {
    const detail = item.eventDetail;

    if (!detail) {
      return this.labels.myTickets.venueFallback;
    }

    return `${detail.venue.name} · ${detail.venue.city}`;
  }

  private async loadTickets(userId: string): Promise<void> {
    const requestId = this.pageState.start();

    try {
      const items = await this.ticketsRepository.listMyTicketItems(userId);

      if (!this.pageState.isCurrent(requestId)) {
        return;
      }

      this.items.set(items);
    } finally {
      this.pageState.finish(requestId);
    }
  }

  private isUpcomingValid(item: TicketListItemReadModel): boolean {
    const startsAt = item.eventDetail?.event.startsAt;

    return (
      item.ticket.status === 'valid' && (!startsAt || new Date(startsAt).getTime() >= Date.now())
    );
  }
}
