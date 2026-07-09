import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { Attendee, EventDetail, PaymentMethod } from '../../../data-access/models';
import { OrganizerOrder, OrganizerRepository } from '../../../data-access/repositories/organizer-repository';
import { EmptyState, LoadingState, MetricCard } from '../../../shared/ui';

interface ReportBar {
  label: string;
  value: number;
  displayValue: string;
  percentage: number;
}

@Component({
  selector: 'app-reports',
  imports: [EmptyState, LoadingState, MetricCard, RouterLink],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reports {
  private readonly auth = inject(MockAuth);
  private readonly organizerRepository = inject(OrganizerRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.paramMap);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly eventDetail = signal<EventDetail | null>(null);
  protected readonly orders = signal<OrganizerOrder[]>([]);
  protected readonly attendees = signal<Attendee[]>([]);
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly organizerId = computed(() => this.auth.currentOrganizerId());
  protected readonly paidOrders = computed(() => this.orders().filter((entry) => entry.order.status === 'paid'));
  protected readonly totalRevenue = computed(() => this.paidOrders().reduce((total, entry) => total + entry.order.total, 0));
  protected readonly ticketsSold = computed(() => this.attendees().length);
  protected readonly checkedInCount = computed(() => this.attendees().filter((attendee) => attendee.ticket.status === 'used').length);
  protected readonly pendingCount = computed(() => Math.max(this.ticketsSold() - this.checkedInCount(), 0));
  protected readonly hasReportData = computed(() => this.orders().length > 0 || this.attendees().length > 0 || Boolean(this.eventDetail()?.ticketTypes.length));
  protected readonly metricCards = computed(() => [
    {
      title: this.labels.organizerReports.metrics.revenue,
      value: this.formatMoney(this.totalRevenue()),
      tone: 'primary' as const,
    },
    {
      title: this.labels.organizerReports.metrics.ticketsSold,
      value: this.ticketsSold(),
      tone: 'success' as const,
    },
    {
      title: this.labels.organizerReports.metrics.checkedIn,
      value: this.checkedInCount(),
      tone: 'warning' as const,
    },
    {
      title: this.labels.organizerReports.metrics.paidOrders,
      value: this.paidOrders().length,
      tone: 'neutral' as const,
    },
  ]);
  protected readonly revenueByTicketType = computed<ReportBar[]>(() => {
    const bars = this.eventDetail()?.ticketTypes.map((ticketType) => ({
      label: ticketType.name,
      value: ticketType.price * ticketType.quantitySold,
      displayValue: this.formatMoney(ticketType.price * ticketType.quantitySold, ticketType.currency),
    })) ?? [];

    return this.withPercentages(bars);
  });
  protected readonly ticketsByType = computed<ReportBar[]>(() => {
    const bars = this.eventDetail()?.ticketTypes.map((ticketType) => ({
      label: ticketType.name,
      value: ticketType.quantitySold,
      displayValue: `${ticketType.quantitySold} ${this.labels.organizerReports.labels.sold}`,
    })) ?? [];

    return this.withPercentages(bars);
  });
  protected readonly checkInBars = computed<ReportBar[]>(() => this.withPercentages([
    {
      label: this.labels.organizerReports.labels.checkedIn,
      value: this.checkedInCount(),
      displayValue: `${this.checkedInCount()} ${this.labels.organizerReports.labels.checkedIn}`,
    },
    {
      label: this.labels.organizerReports.labels.pending,
      value: this.pendingCount(),
      displayValue: `${this.pendingCount()} ${this.labels.organizerReports.labels.pending}`,
    },
  ]));
  protected readonly paymentBars = computed<ReportBar[]>(() => {
    const totals = new Map<string, number>();

    for (const entry of this.orders()) {
      const key = entry.order.paymentMethod ? this.labels.checkout.paymentMethods[entry.order.paymentMethod as PaymentMethod] : this.labels.organizerReports.labels.noPaymentMethod;

      totals.set(key, (totals.get(key) ?? 0) + 1);
    }

    return this.withPercentages([...totals.entries()].map(([label, value]) => ({
      label,
      value,
      displayValue: `${value} ${this.labels.organizerReports.labels.orders}`,
    })));
  });

  constructor() {
    effect(() => {
      const organizerId = this.organizerId();
      const eventId = this.eventId();

      if (organizerId && eventId) {
        void this.loadReports(organizerId, eventId);
      }
    });
  }

  protected formatMoney(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('es-VE', {
      currency,
      style: 'currency',
    }).format(value);
  }

  private async loadReports(organizerId: string, eventId: string): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);
    this.notFound.set(false);

    try {
      const [eventDetail, orders, attendees] = await Promise.all([
        this.organizerRepository.getEvent(organizerId, eventId),
        this.organizerRepository.listEventOrders(organizerId, eventId),
        this.organizerRepository.listEventAttendees(organizerId, eventId),
      ]);

      if (requestId !== this.loadRequestId) {
        return;
      }

      this.notFound.set(!eventDetail);
      this.eventDetail.set(eventDetail);
      this.orders.set(orders);
      this.attendees.set(attendees);
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }

  private withPercentages(items: Array<Omit<ReportBar, 'percentage'>>): ReportBar[] {
    const max = Math.max(...items.map((item) => item.value), 0);

    return items.map((item) => ({
      ...item,
      percentage: max > 0 ? Math.round((item.value / max) * 100) : 0,
    }));
  }
}
