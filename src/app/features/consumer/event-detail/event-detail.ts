import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { EventCategory, EventDetail as EventDetailModel } from '../../../data-access/models';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { EmptyState, LoadingState, OrderSummary, OrderSummaryItem, StatusBadge, TicketTypeSelector } from '../../../shared/ui';

@Component({
  selector: 'app-event-detail',
  imports: [EmptyState, LoadingState, OrderSummary, RouterLink, StatusBadge, TicketTypeSelector],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly eventsRepository = inject(EventsRepository);
  private readonly routeParams = toSignal(this.route.paramMap);

  protected readonly labels = appLabels;
  protected readonly eventDetail = signal<EventDetailModel | null>(null);
  protected readonly loading = signal(true);
  protected readonly quantities = signal<Record<string, number>>({});
  protected readonly selectedItems = computed<OrderSummaryItem[]>(() => {
    const eventDetail = this.eventDetail();

    if (!eventDetail) {
      return [];
    }

    return eventDetail.ticketTypes
      .map((ticketType) => ({
        currency: ticketType.currency,
        label: ticketType.name,
        quantity: this.quantities()[ticketType.id] ?? 0,
        unitPrice: ticketType.price,
      }))
      .filter((item) => item.quantity > 0);
  });
  protected readonly subtotal = computed(() => this.selectedItems().reduce((total, item) => total + item.quantity * item.unitPrice, 0));
  protected readonly fees = computed(() => Number((this.subtotal() * 0.08).toFixed(2)));
  protected readonly selectedCount = computed(() => this.selectedItems().reduce((total, item) => total + item.quantity, 0));
  protected readonly checkoutLink = computed(() => {
    const eventDetail = this.eventDetail();

    return eventDetail ? ['/checkout', eventDetail.event.id] : ['/events'];
  });
  protected readonly eventDate = computed(() => {
    const eventDetail = this.eventDetail();

    return eventDetail
      ? new Intl.DateTimeFormat('es-VE', {
          dateStyle: 'full',
          timeStyle: 'short',
        }).format(new Date(eventDetail.event.startsAt))
      : '';
  });
  protected readonly categoryLabel = computed(() => {
    const category = this.eventDetail()?.event.category;

    return category ? appLabels.shared.eventCard.categories[category as EventCategory] : '';
  });

  constructor() {
    effect(() => {
      const slug = this.routeParams()?.get('eventSlug');

      if (slug) {
        void this.loadEvent(slug);
      }
    });
  }

  protected updateQuantity(ticketTypeId: string, quantity: number): void {
    this.quantities.update((currentQuantities) => ({
      ...currentQuantities,
      [ticketTypeId]: quantity,
    }));
  }

  protected quantityFor(ticketTypeId: string): number {
    return this.quantities()[ticketTypeId] ?? 0;
  }

  private async loadEvent(slug: string): Promise<void> {
    this.loading.set(true);
    this.quantities.set({});

    try {
      this.eventDetail.set(await this.eventsRepository.getEventBySlug(slug));
    } finally {
      this.loading.set(false);
    }
  }
}
