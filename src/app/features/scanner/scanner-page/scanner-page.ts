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
import { ScanResult, ScannerEventSummary } from '../../../data-access/models';
import { ScannerRepository } from '../../../data-access/repositories/scanner-repository';
import { formatDateEsVe } from '../../../shared/formatting/formatters';
import { createAsyncPageState } from '../../../shared/state/async-page-state';
import { EmptyState, LoadingState, ScanResultPanel, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-scanner-page',
  imports: [EmptyState, LoadingState, RouterLink, ScanResultPanel, StatusBadge],
  templateUrl: './scanner-page.html',
  styleUrl: './scanner-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScannerPage {
  private readonly auth = inject(MockAuth);
  private readonly route = inject(ActivatedRoute);
  private readonly scannerRepository = inject(ScannerRepository);
  private readonly routeParams = toSignal(this.route.paramMap);
  private readonly routeQueryParams = toSignal(this.route.queryParamMap);
  private readonly pageState = createAsyncPageState();

  protected readonly labels = appLabels;
  protected readonly loading = this.pageState.loading;
  protected readonly validating = signal(false);
  protected readonly checkingIn = signal(false);
  protected readonly errorMessage = this.pageState.errorMessage;
  protected readonly operationError = signal<string | null>(null);
  protected readonly submitted = signal(false);
  protected readonly eventSummary = signal<ScannerEventSummary | null>(null);
  protected readonly qrCode = signal('');
  protected readonly currentResult = signal<ScanResult | null>(null);
  protected readonly recentResults = signal<ScanResult[]>([]);
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly isValidInput = computed(() => this.qrCode().trim().length > 0);
  protected readonly canCheckIn = computed(
    () => this.currentResult()?.status === 'accepted' && Boolean(this.currentResult()?.ticket),
  );

  constructor() {
    effect(() => {
      const eventId = this.eventId();
      const qrCode = this.routeQueryParams()?.get('qr')?.trim();

      if (qrCode && qrCode !== this.qrCode()) {
        this.qrCode.set(qrCode);
      }

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
    this.operationError.set(null);

    try {
      const result = await this.scannerRepository.validateTicket(eventId, this.qrCode());

      this.recordResult(result);
    } catch {
      this.operationError.set(this.labels.scannerPage.operationError);
    } finally {
      this.validating.set(false);
    }
  }

  protected async checkIn(): Promise<void> {
    if (!this.canCheckIn() || this.checkingIn()) {
      return;
    }

    const eventId = this.eventId();
    const scannerUserId = this.auth.currentScannerUserId();

    if (!eventId || !scannerUserId) {
      return;
    }

    this.checkingIn.set(true);
    this.operationError.set(null);

    try {
      const result = await this.scannerRepository.checkIn(
        eventId,
        this.currentResult()?.ticket?.qrCode ?? this.qrCode(),
        scannerUserId,
      );

      this.recordResult(result);
      await this.loadEvent(eventId, false);
    } catch {
      this.operationError.set(this.labels.scannerPage.operationError);
    } finally {
      this.checkingIn.set(false);
    }
  }

  protected updateQrCode(value: string): void {
    this.qrCode.set(value);
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
      void this.loadEvent(eventId);
    }
  }

  private recordResult(result: ScanResult): void {
    this.currentResult.set(result);
    this.recentResults.update((results) => [result, ...results].slice(0, 5));
  }

  private async loadEvent(eventId: string, showLoading = true): Promise<void> {
    const requestId = this.pageState.start(showLoading);

    try {
      const eventSummary = await this.scannerRepository.getEventSummary(eventId);

      if (!this.pageState.isCurrent(requestId)) {
        return;
      }

      this.eventSummary.set(eventSummary);
    } catch {
      if (this.pageState.isCurrent(requestId)) {
        this.eventSummary.set(null);
        this.pageState.setError(requestId, this.labels.scannerPage.errorDescription);
      }
    } finally {
      this.pageState.finish(requestId, showLoading);
    }
  }
}
