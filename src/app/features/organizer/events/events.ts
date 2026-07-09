import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { Currency, EventDetail } from '../../../data-access/models';
import { OrganizerRepository } from '../../../data-access/repositories/organizer-repository';
import { EmptyState, LoadingState, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-events',
  imports: [EmptyState, LoadingState, RouterLink, StatusBadge],
  templateUrl: './events.html',
  styleUrl: './events.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Events {
  private readonly auth = inject(MockAuth);
  private readonly organizerRepository = inject(OrganizerRepository);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly events = signal<EventDetail[]>([]);
  protected readonly organizerId = computed(() => this.auth.currentOrganizerId());

  constructor() {
    effect(() => {
      const organizerId = this.organizerId();

      if (organizerId) {
        void this.loadEvents(organizerId);
      }
    });
  }

  protected ticketsSold(event: EventDetail): number {
    return event.ticketTypes.reduce((total, ticketType) => total + ticketType.quantitySold, 0);
  }

  protected revenue(event: EventDetail): string {
    const total = event.ticketTypes.reduce((sum, ticketType) => sum + ticketType.quantitySold * ticketType.price, 0);
    const currency = event.ticketTypes[0]?.currency ?? 'USD';

    return this.formatMoney(total, currency);
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  private formatMoney(value: number, currency: Currency): string {
    return new Intl.NumberFormat('es-VE', {
      currency,
      style: 'currency',
    }).format(value);
  }

  private async loadEvents(organizerId: string): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);

    try {
      const events = await this.organizerRepository.listEvents(organizerId);

      if (requestId === this.loadRequestId) {
        this.events.set(events.sort((first, second) => first.event.startsAt.localeCompare(second.event.startsAt)));
      }
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }
}
