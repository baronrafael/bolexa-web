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
import { Attendee } from '../../../data-access/models';
import { OrganizerRepository } from '../../../data-access/repositories/organizer-repository';
import { formatDateEsVe } from '../../../shared/formatting/formatters';
import { normalizeSearch } from '../../../shared/search/normalize-search';
import { EmptyState, LoadingState, MetricCard, SearchInput, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-attendees',
  imports: [EmptyState, LoadingState, MetricCard, RouterLink, SearchInput, StatusBadge],
  templateUrl: './attendees.html',
  styleUrl: './attendees.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Attendees {
  private readonly auth = inject(MockAuth);
  private readonly organizerRepository = inject(OrganizerRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.paramMap);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly attendees = signal<Attendee[]>([]);
  protected readonly eventTitle = signal('');
  protected readonly searchQuery = signal('');
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly organizerId = computed(() => this.auth.currentOrganizerId());
  protected readonly filteredAttendees = computed(() => {
    const query = normalizeSearch(this.searchQuery());

    if (!query) {
      return this.attendees();
    }

    return this.attendees().filter((attendee) => {
      const searchable = normalizeSearch(
        `${attendee.ticket.holderName} ${attendee.ticket.holderEmail} ${attendee.ticket.id} ${attendee.ticket.qrCode} ${attendee.order.id} ${attendee.ticketType.name}`,
      );

      return searchable.includes(query);
    });
  });
  protected readonly checkedInCount = computed(
    () => this.attendees().filter((attendee) => attendee.ticket.status === 'used').length,
  );
  protected readonly pendingCount = computed(
    () => this.attendees().filter((attendee) => attendee.ticket.status === 'valid').length,
  );
  protected readonly metrics = computed(() => [
    {
      title: this.labels.organizerAttendees.metrics.total,
      value: this.attendees().length,
      tone: 'primary' as const,
    },
    {
      title: this.labels.organizerAttendees.metrics.checkedIn,
      value: this.checkedInCount(),
      tone: 'success' as const,
    },
    {
      title: this.labels.organizerAttendees.metrics.pending,
      value: this.pendingCount(),
      tone: 'warning' as const,
    },
  ]);

  constructor() {
    effect(() => {
      const organizerId = this.organizerId();
      const eventId = this.eventId();

      if (organizerId && eventId) {
        void this.loadAttendees(organizerId, eventId);
      }
    });
  }

  protected checkInLabel(attendee: Attendee): string {
    return attendee.ticket.checkedInAt
      ? this.formatDate(attendee.ticket.checkedInAt)
      : this.labels.organizerAttendees.notCheckedIn;
  }

  protected formatDate(value: string): string {
    return formatDateEsVe(value, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  protected exportCsv(): void {
    const rows = [
      [
        'holder_name',
        'holder_email',
        'ticket_type',
        'ticket_status',
        'checked_in_at',
        'order_id',
        'ticket_id',
        'qr_code',
      ],
      ...this.filteredAttendees().map((attendee) => [
        attendee.ticket.holderName,
        attendee.ticket.holderEmail,
        attendee.ticketType.name,
        attendee.ticket.status,
        attendee.ticket.checkedInAt ?? '',
        attendee.order.id,
        attendee.ticket.id,
        attendee.ticket.qrCode,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `bolexa-attendees-${this.eventId() ?? 'event'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private async loadAttendees(organizerId: string, eventId: string): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);
    this.notFound.set(false);

    try {
      const [eventDetail, attendees] = await Promise.all([
        this.organizerRepository.getEvent(organizerId, eventId),
        this.organizerRepository.listEventAttendees(organizerId, eventId),
      ]);

      if (requestId !== this.loadRequestId) {
        return;
      }

      this.notFound.set(!eventDetail);
      this.eventTitle.set(eventDetail?.event.title ?? '');
      this.attendees.set(
        attendees.sort((first, second) =>
          first.ticket.holderName.localeCompare(second.ticket.holderName),
        ),
      );
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }
}
