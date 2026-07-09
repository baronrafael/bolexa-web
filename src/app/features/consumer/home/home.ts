import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { EventDetail } from '../../../data-access/models';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { createAsyncPageState } from '../../../shared/state/async-page-state';
import { EmptyState, EventCard, LoadingState, MetricCard } from '../../../shared/ui';

type CapabilityCardTone = (typeof appLabels.home.capabilityCards)[number]['tone'];

@Component({
  selector: 'app-home',
  imports: [EmptyState, EventCard, LoadingState, MetricCard, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly eventsRepository = inject(EventsRepository);
  private readonly pageState = createAsyncPageState();

  protected readonly labels = appLabels;
  protected readonly events = signal<EventDetail[]>([]);
  protected readonly loading = this.pageState.loading;
  protected readonly featuredEvent = computed(() => this.events()[0]);
  protected readonly upcomingEvents = computed(() => this.events().slice(1, 7));
  protected readonly capabilityCardClasses = {
    success: 'rounded-2xl border border-success/30 bg-success/10 p-4',
    warning: 'rounded-2xl border border-warning/30 bg-warning/10 p-4',
    primary: 'rounded-2xl border border-primary/30 bg-primary/10 p-4',
  } satisfies Record<CapabilityCardTone, string>;
  protected readonly capabilityCardEyebrowClasses = {
    success: 'text-xs font-semibold uppercase tracking-wide text-success',
    warning: 'text-xs font-semibold uppercase tracking-wide text-warning',
    primary: 'text-xs font-semibold uppercase tracking-wide text-primary',
  } satisfies Record<CapabilityCardTone, string>;

  constructor() {
    void this.loadFeaturedEvents();
  }

  private async loadFeaturedEvents(): Promise<void> {
    const requestId = this.pageState.start();

    try {
      const events = await this.eventsRepository.listEvents();

      if (!this.pageState.isCurrent(requestId)) {
        return;
      }

      this.events.set(events);
    } finally {
      this.pageState.finish(requestId);
    }
  }
}
