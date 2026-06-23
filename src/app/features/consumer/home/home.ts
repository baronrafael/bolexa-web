import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { EventDetail } from '../../../data-access/models';
import { EventsRepository } from '../../../data-access/repositories/events-repository';

type StatusCardTone = (typeof appLabels.home.statusCards)[number]['tone'];

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly eventsRepository = inject(EventsRepository);

  protected readonly labels = appLabels;
  protected readonly featuredEvents = signal<EventDetail[]>([]);
  protected readonly loading = signal(true);
  protected readonly statusCardClasses = {
    success: 'rounded-2xl border border-success/30 bg-success/10 p-4',
    warning: 'rounded-2xl border border-warning/30 bg-warning/10 p-4',
    primary: 'rounded-2xl border border-primary/30 bg-primary/10 p-4',
  } satisfies Record<StatusCardTone, string>;
  protected readonly statusCardEyebrowClasses = {
    success: 'text-xs font-semibold uppercase tracking-wide text-success',
    warning: 'text-xs font-semibold uppercase tracking-wide text-warning',
    primary: 'text-xs font-semibold uppercase tracking-wide text-primary',
  } satisfies Record<StatusCardTone, string>;

  constructor() {
    void this.loadFeaturedEvents();
  }

  private async loadFeaturedEvents(): Promise<void> {
    try {
      this.featuredEvents.set(await this.eventsRepository.getFeaturedEvents(3));
    } finally {
      this.loading.set(false);
    }
  }
}
