import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
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
  private readonly eventsResource = resource({
    loader: () => this.eventsRepository.listEvents(),
  });

  protected readonly labels = appLabels;
  protected readonly events = computed(() => this.eventsResource.value() ?? []);
  protected readonly loading = this.eventsResource.isLoading;
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
}
