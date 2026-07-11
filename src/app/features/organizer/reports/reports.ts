import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { Attendee, EventDetail } from '../../../data-access/models';
import { buildOrganizerReportReadModel } from '../../../data-access/reports/organizer-report-read-model';
import {
  OrganizerOrder,
  OrganizerRepository,
} from '../../../data-access/repositories/organizer-repository';
import { formatMoneyEsVe } from '../../../shared/formatting/formatters';
import { createAsyncPageState } from '../../../shared/state/async-page-state';
import { EmptyState, LoadingState, MetricCard } from '../../../shared/ui';

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
  private readonly pageState = createAsyncPageState();

  protected readonly labels = appLabels;
  protected readonly loading = this.pageState.loading;
  protected readonly notFound = this.pageState.notFound;
  protected readonly eventDetail = signal<EventDetail | null>(null);
  protected readonly orders = signal<OrganizerOrder[]>([]);
  protected readonly attendees = signal<Attendee[]>([]);
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly organizerId = computed(() => this.auth.currentOrganizerId());
  protected readonly report = computed(() =>
    buildOrganizerReportReadModel({
      eventDetail: this.eventDetail(),
      orders: this.orders(),
      attendees: this.attendees(),
      labels: {
        metrics: this.labels.organizerReports.metrics,
        labels: this.labels.organizerReports.labels,
        paymentMethods: this.labels.checkout.paymentMethods,
      },
      formatMoney: (value, currency) => this.formatMoney(value, currency),
    }),
  );

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
    return formatMoneyEsVe(value, currency);
  }

  private async loadReports(organizerId: string, eventId: string): Promise<void> {
    const requestId = this.pageState.start();

    try {
      const [eventDetail, orders, attendees] = await Promise.all([
        this.organizerRepository.getEvent(organizerId, eventId),
        this.organizerRepository.listEventOrders(organizerId, eventId),
        this.organizerRepository.listEventAttendees(organizerId, eventId),
      ]);

      if (!this.pageState.isCurrent(requestId)) {
        return;
      }

      this.pageState.setNotFound(requestId, !eventDetail);
      this.eventDetail.set(eventDetail);
      this.orders.set(orders);
      this.attendees.set(attendees);
    } finally {
      this.pageState.finish(requestId);
    }
  }
}
