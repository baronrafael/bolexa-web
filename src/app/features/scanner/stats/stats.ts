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
import { appLabels } from '../../../core/content/app-labels';
import { Attendee, ScannerEventSummary } from '../../../data-access/models';
import { ScannerRepository } from '../../../data-access/repositories/scanner-repository';
import { formatDateEsVe } from '../../../shared/formatting/formatters';
import { EmptyState, LoadingState, MetricCard, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-stats',
  imports: [EmptyState, LoadingState, MetricCard, RouterLink, StatusBadge],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stats {
  private readonly route = inject(ActivatedRoute);
  private readonly scannerRepository = inject(ScannerRepository);
  private readonly routeParams = toSignal(this.route.paramMap);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly eventSummary = signal<ScannerEventSummary | null>(null);
  protected readonly attendees = signal<Attendee[]>([]);
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly pendingTickets = computed(() =>
    Math.max(
      (this.eventSummary()?.totalTickets ?? 0) - (this.eventSummary()?.checkedInTickets ?? 0),
      0,
    ),
  );
  protected readonly progress = computed(() => {
    const summary = this.eventSummary();

    return summary && summary.totalTickets > 0
      ? Math.round((summary.checkedInTickets / summary.totalTickets) * 100)
      : 0;
  });
  protected readonly metricCards = computed(() => [
    {
      title: this.labels.scannerStats.metrics.total,
      value: this.eventSummary()?.totalTickets ?? 0,
      tone: 'primary' as const,
    },
    {
      title: this.labels.scannerStats.metrics.checkedIn,
      value: this.eventSummary()?.checkedInTickets ?? 0,
      tone: 'success' as const,
    },
    {
      title: this.labels.scannerStats.metrics.pending,
      value: this.pendingTickets(),
      tone: 'warning' as const,
    },
    {
      title: this.labels.scannerStats.metrics.progress,
      value: `${this.progress()}%`,
      tone: 'neutral' as const,
    },
  ]);
  protected readonly recentCheckIns = computed(() =>
    this.attendees()
      .filter((attendee) => Boolean(attendee.ticket.checkedInAt))
      .sort((first, second) =>
        (second.ticket.checkedInAt ?? '').localeCompare(first.ticket.checkedInAt ?? ''),
      )
      .slice(0, 8),
  );

  constructor() {
    effect(() => {
      const eventId = this.eventId();

      if (eventId) {
        void this.loadStats(eventId);
      }
    });
  }

  protected formatDate(value?: string): string {
    if (!value) {
      return '-';
    }

    return formatDateEsVe(value, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  protected retryLoad(): void {
    const eventId = this.eventId();

    if (eventId) {
      void this.loadStats(eventId);
    }
  }

  private async loadStats(eventId: string): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const [eventSummary, attendees] = await Promise.all([
        this.scannerRepository.getEventSummary(eventId),
        this.scannerRepository.listAttendees(eventId),
      ]);

      if (requestId !== this.loadRequestId) {
        return;
      }

      this.eventSummary.set(eventSummary);
      this.attendees.set(attendees);
    } catch {
      if (requestId === this.loadRequestId) {
        this.eventSummary.set(null);
        this.attendees.set([]);
        this.errorMessage.set(this.labels.scannerStats.errorDescription);
      }
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }
}
