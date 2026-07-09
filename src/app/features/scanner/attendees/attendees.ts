import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { Attendee, ScanResult, ScannerEventSummary } from '../../../data-access/models';
import { ScannerRepository } from '../../../data-access/repositories/scanner-repository';
import { normalizeSearch } from '../../../shared/search/normalize-search';
import { EmptyState, LoadingState, ScanResultPanel, SearchInput, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-attendees',
  imports: [EmptyState, LoadingState, RouterLink, ScanResultPanel, SearchInput, StatusBadge],
  templateUrl: './attendees.html',
  styleUrl: './attendees.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Attendees {
  private readonly auth = inject(MockAuth);
  private readonly route = inject(ActivatedRoute);
  private readonly scannerRepository = inject(ScannerRepository);
  private readonly routeParams = toSignal(this.route.paramMap);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly validating = signal(false);
  protected readonly checkingIn = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly operationError = signal<string | null>(null);
  protected readonly eventSummary = signal<ScannerEventSummary | null>(null);
  protected readonly attendees = signal<Attendee[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly selectedTicketId = signal<string | null>(null);
  protected readonly currentResult = signal<ScanResult | null>(null);
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly filteredAttendees = computed(() => {
    const query = normalizeSearch(this.searchQuery());

    if (!query) {
      return this.attendees();
    }

    return this.attendees().filter((attendee) => {
      const searchable = normalizeSearch(`${attendee.ticket.holderName} ${attendee.ticket.holderEmail} ${attendee.ticket.qrCode} ${attendee.order.id} ${attendee.ticketType.name}`);

      return searchable.includes(query);
    });
  });
  protected readonly selectedAttendee = computed(() => {
    const selectedTicketId = this.selectedTicketId();

    return selectedTicketId ? this.attendees().find((attendee) => attendee.ticket.id === selectedTicketId) ?? null : null;
  });
  protected readonly canCheckIn = computed(() => this.currentResult()?.status === 'accepted' && Boolean(this.currentResult()?.ticket));

  constructor() {
    effect(() => {
      const eventId = this.eventId();

      if (eventId) {
        void this.loadData(eventId);
      }
    });
  }

  protected select(attendee: Attendee): void {
    this.selectedTicketId.set(attendee.ticket.id);
    this.currentResult.set(null);
  }

  protected async validateSelected(): Promise<void> {
    const eventId = this.eventId();
    const attendee = this.selectedAttendee();

    if (!eventId || !attendee || this.validating()) {
      return;
    }

    this.validating.set(true);
    this.operationError.set(null);

    try {
      this.currentResult.set(await this.scannerRepository.validateTicket(eventId, attendee.ticket.qrCode));
    } catch {
      this.operationError.set(this.labels.scannerAttendees.operationError);
    } finally {
      this.validating.set(false);
    }
  }

  protected async checkInSelected(): Promise<void> {
    const eventId = this.eventId();
    const attendee = this.selectedAttendee();
    const scannerUserId = this.auth.currentScannerUserId();

    if (!eventId || !attendee || !scannerUserId || !this.canCheckIn() || this.checkingIn()) {
      return;
    }

    this.checkingIn.set(true);
    this.operationError.set(null);

    try {
      this.currentResult.set(await this.scannerRepository.checkIn(eventId, attendee.ticket.qrCode, scannerUserId));
      await this.loadData(eventId, false);
    } catch {
      this.operationError.set(this.labels.scannerAttendees.operationError);
    } finally {
      this.checkingIn.set(false);
    }
  }

  protected retryLoad(): void {
    const eventId = this.eventId();

    if (eventId) {
      void this.loadData(eventId);
    }
  }

  private async loadData(eventId: string, showLoading = true): Promise<void> {
    const requestId = ++this.loadRequestId;

    if (showLoading) {
      this.loading.set(true);
    }

    this.errorMessage.set(null);

    try {
      const [events, attendees] = await Promise.all([
        this.scannerRepository.listEvents(),
        this.scannerRepository.listAttendees(eventId),
      ]);

      if (requestId !== this.loadRequestId) {
        return;
      }

      this.eventSummary.set(events.find((event) => event.event.id === eventId) ?? null);
      this.attendees.set(attendees.sort((first, second) => first.ticket.holderName.localeCompare(second.ticket.holderName)));
    } catch {
      if (requestId === this.loadRequestId) {
        this.eventSummary.set(null);
        this.attendees.set([]);
        this.errorMessage.set(this.labels.scannerAttendees.errorDescription);
      }
    } finally {
      if (requestId === this.loadRequestId && showLoading) {
        this.loading.set(false);
      }
    }
  }
}
