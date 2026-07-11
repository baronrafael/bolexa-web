import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { appLabels } from '../../../core/content/app-labels';
import { EventCategory, EventDetail } from '../../../data-access/models';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { normalizeSearch } from '../../../shared/search/normalize-search';
import { EmptyState, EventCard, LoadingState, SearchInput } from '../../../shared/ui';

type CategoryFilter = EventCategory | 'all';
type DateFilter = 'all' | 'next_90_days' | 'later';

@Component({
  selector: 'app-events-list',
  imports: [EmptyState, EventCard, LoadingState, SearchInput],
  templateUrl: './events-list.html',
  styleUrl: './events-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsList {
  private readonly eventsRepository = inject(EventsRepository);
  private readonly eventsResource = resource({
    loader: () => this.eventsRepository.listEvents(),
  });

  protected readonly labels = appLabels;
  protected readonly events = computed(() => this.eventsResource.value() ?? []);
  protected readonly loading = this.eventsResource.isLoading;
  protected readonly query = signal('');
  protected readonly selectedCategory = signal<CategoryFilter>('all');
  protected readonly selectedCity = signal('all');
  protected readonly selectedDate = signal<DateFilter>('all');
  protected readonly categoryOptions = (
    Object.entries(appLabels.shared.eventCard.categories) as Array<[EventCategory, string]>
  ).map(([value, label]) => ({
    label,
    value,
  }));
  protected readonly dateOptions: Array<{ label: string; value: DateFilter }> = [
    { label: appLabels.eventsList.filters.allDates, value: 'all' },
    { label: appLabels.eventsList.filters.next90Days, value: 'next_90_days' },
    { label: appLabels.eventsList.filters.later, value: 'later' },
  ];
  protected readonly cityOptions = computed(() => {
    const cities = new Set(this.events().map((eventDetail) => eventDetail.venue.city));

    return [...cities].sort((first, second) => first.localeCompare(second));
  });
  protected readonly filteredEvents = computed(() => {
    const query = normalizeSearch(this.query());
    const selectedCategory = this.selectedCategory();
    const selectedCity = this.selectedCity();
    const selectedDate = this.selectedDate();

    return this.events().filter((eventDetail) => {
      const searchableText = normalizeSearch(
        `${eventDetail.event.title} ${eventDetail.event.description} ${eventDetail.venue.name} ${eventDetail.venue.city}`,
      );

      return (
        (!query || searchableText.includes(query)) &&
        (selectedCategory === 'all' || eventDetail.event.category === selectedCategory) &&
        (selectedCity === 'all' || eventDetail.venue.city === selectedCity) &&
        this.matchesDateFilter(eventDetail, selectedDate)
      );
    });
  });
  protected readonly resultCountLabel = computed(() => {
    const count = this.filteredEvents().length;
    const suffix =
      count === 1 ? this.labels.eventsList.results.singular : this.labels.eventsList.results.plural;

    return `${count} ${suffix}`;
  });

  protected setQuery(query: string): void {
    this.query.set(query);
  }

  protected setCategory(event: Event): void {
    this.selectedCategory.set((event.target as HTMLSelectElement).value as CategoryFilter);
  }

  protected setCity(event: Event): void {
    this.selectedCity.set((event.target as HTMLSelectElement).value);
  }

  protected setDate(event: Event): void {
    this.selectedDate.set((event.target as HTMLSelectElement).value as DateFilter);
  }

  private matchesDateFilter(eventDetail: EventDetail, filter: DateFilter): boolean {
    if (filter === 'all') {
      return true;
    }

    const eventDate = new Date(eventDetail.event.startsAt).getTime();
    const now = Date.now();
    const next90Days = now + 90 * 24 * 60 * 60 * 1000;

    return filter === 'next_90_days'
      ? eventDate >= now && eventDate <= next90Days
      : eventDate > next90Days;
  }
}
