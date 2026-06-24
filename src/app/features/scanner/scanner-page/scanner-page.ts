import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { ScanResult, ScannerEventSummary } from '../../../data-access/models';
import { ScannerRepository } from '../../../data-access/repositories/scanner-repository';
import { EmptyState, LoadingState, ScanResultPanel, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-scanner-page',
  imports: [EmptyState, LoadingState, RouterLink, ScanResultPanel, StatusBadge],
  templateUrl: './scanner-page.html',
  styleUrl: './scanner-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScannerPage {
  private readonly route = inject(ActivatedRoute);
  private readonly scannerRepository = inject(ScannerRepository);
  private readonly routeParams = toSignal(this.route.paramMap);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly validating = signal(false);
  protected readonly submitted = signal(false);
  protected readonly eventSummary = signal<ScannerEventSummary | null>(null);
  protected readonly qrCode = signal('');
  protected readonly currentResult = signal<ScanResult | null>(null);
  protected readonly recentResults = signal<ScanResult[]>([]);
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly isValidInput = computed(() => this.qrCode().trim().length > 0);

  constructor() {
    effect(() => {
      const eventId = this.eventId();

      if (eventId) {
        void this.loadEvent(eventId);
      }
    });
  }

  protected async validate(): Promise<void> {
    this.submitted.set(true);

    if (!this.isValidInput() || this.validating()) {
      return;
    }

    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.validating.set(true);

    try {
      const result = await this.scannerRepository.validateTicket(eventId, this.qrCode());

      this.currentResult.set(result);
      this.recentResults.update((results) => [result, ...results].slice(0, 5));
    } finally {
      this.validating.set(false);
    }
  }

  protected updateQrCode(value: string): void {
    this.qrCode.set(value);
  }

  protected formatDate(value?: string): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  private async loadEvent(eventId: string): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);

    try {
      const events = await this.scannerRepository.listEvents();
      const eventSummary = events.find((event) => event.event.id === eventId) ?? null;

      if (requestId === this.loadRequestId) {
        this.eventSummary.set(eventSummary);
      }
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }
}
