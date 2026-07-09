import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { ScannerEventSummary } from '../../../data-access/models';
import { ScannerRepository } from '../../../data-access/repositories/scanner-repository';
import { formatDateEsVe } from '../../../shared/formatting/formatters';
import { createAsyncPageState } from '../../../shared/state/async-page-state';
import { EmptyState, LoadingState, MetricCard, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-events',
  imports: [EmptyState, LoadingState, MetricCard, RouterLink, StatusBadge],
  templateUrl: './events.html',
  styleUrl: './events.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Events {
  private readonly scannerRepository = inject(ScannerRepository);
  private readonly pageState = createAsyncPageState();

  protected readonly labels = appLabels;
  protected readonly loading = this.pageState.loading;
  protected readonly errorMessage = this.pageState.errorMessage;
  protected readonly events = signal<ScannerEventSummary[]>([]);

  constructor() {
    void this.loadEvents();
  }

  protected checkedInPercentage(event: ScannerEventSummary): number {
    return event.totalTickets > 0
      ? Math.round((event.checkedInTickets / event.totalTickets) * 100)
      : 0;
  }

  protected pendingTickets(event: ScannerEventSummary): number {
    return Math.max(event.totalTickets - event.checkedInTickets, 0);
  }

  protected formatDate(value: string): string {
    return formatDateEsVe(value, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  protected retryLoad(): void {
    void this.loadEvents();
  }

  private async loadEvents(): Promise<void> {
    const requestId = this.pageState.start();

    try {
      const events = await this.scannerRepository.listEvents();

      if (!this.pageState.isCurrent(requestId)) {
        return;
      }

      this.events.set(
        events.sort((first, second) => first.event.startsAt.localeCompare(second.event.startsAt)),
      );
    } catch {
      if (this.pageState.isCurrent(requestId)) {
        this.events.set([]);
        this.pageState.setError(requestId, this.labels.scannerEvents.errorDescription);
      }
    } finally {
      this.pageState.finish(requestId);
    }
  }
}
