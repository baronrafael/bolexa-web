import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventDetail } from '../../../data-access/models';
import { EventsRepository } from '../../../data-access/repositories/events-repository';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly eventsRepository = inject(EventsRepository);

  protected readonly featuredEvents = signal<EventDetail[]>([]);
  protected readonly loading = signal(true);

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
