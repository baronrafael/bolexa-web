import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { ScannerEventSummary } from '../../../data-access/models';
import { ScannerRepository } from '../../../data-access/repositories/scanner-repository';
import { formatDateEsVe } from '../../../shared/formatting/formatters';
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

  protected readonly labels = appLabels;
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
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
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const events = await this.scannerRepository.listEvents();

      this.events.set(
        events.sort((first, second) => first.event.startsAt.localeCompare(second.event.startsAt)),
      );
    } catch {
      this.events.set([]);
      this.errorMessage.set(this.labels.scannerEvents.errorDescription);
    } finally {
      this.loading.set(false);
    }
  }
}
