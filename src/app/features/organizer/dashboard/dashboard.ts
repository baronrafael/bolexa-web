import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { EventDetail, Order, OrganizerDashboardSummary } from '../../../data-access/models';
import { OrganizerRepository } from '../../../data-access/repositories/organizer-repository';
import { EmptyState, LoadingState, MetricCard, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-dashboard',
  imports: [EmptyState, LoadingState, MetricCard, RouterLink, StatusBadge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly auth = inject(MockAuth);
  private readonly organizerRepository = inject(OrganizerRepository);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly summary = signal<OrganizerDashboardSummary | null>(null);
  protected readonly organizerId = computed(() => this.auth.currentOrganizerId());
  protected readonly metricCards = computed(() => {
    const summary = this.summary();
    const labels = this.labels.organizerDashboard.metrics;

    return [
      {
        description: labels.revenueDescription,
        title: labels.revenue,
        tone: 'primary' as const,
        value: this.formatMoney(summary?.totalRevenue ?? 0),
      },
      {
        description: labels.ticketsDescription,
        title: labels.ticketsSold,
        tone: 'success' as const,
        value: summary?.ticketsSold ?? 0,
      },
      {
        description: labels.checkInsDescription,
        title: labels.checkIns,
        tone: 'warning' as const,
        value: summary?.checkIns ?? 0,
      },
      {
        description: labels.upcomingDescription,
        title: labels.upcomingEvents,
        tone: 'neutral' as const,
        value: summary?.upcomingEvents.length ?? 0,
      },
    ];
  });

  constructor() {
    effect(() => {
      const organizerId = this.organizerId();

      if (organizerId) {
        void this.loadDashboard(organizerId);
      }
    });
  }

  protected eventTicketsSold(event: EventDetail): number {
    return event.ticketTypes.reduce((total, ticketType) => total + ticketType.quantitySold, 0);
  }

  protected eventRevenue(event: EventDetail): string {
    const total = event.ticketTypes.reduce((sum, ticketType) => sum + ticketType.quantitySold * ticketType.price, 0);
    const currency = event.ticketTypes[0]?.currency ?? 'USD';

    return this.formatMoney(total, currency);
  }

  protected orderEventTitle(order: Order): string {
    return this.summary()?.upcomingEvents.find((detail) => detail.event.id === order.eventId)?.event.title ?? order.eventId;
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  protected formatMoney(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('es-VE', {
      currency,
      style: 'currency',
    }).format(value);
  }

  private async loadDashboard(organizerId: string): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);

    try {
      const summary = await this.organizerRepository.getDashboard(organizerId);

      if (requestId === this.loadRequestId) {
        this.summary.set(summary);
      }
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }
}
