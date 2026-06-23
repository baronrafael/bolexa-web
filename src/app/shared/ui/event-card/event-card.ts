import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { EventDetail, TicketType } from '../../../data-access/models';

@Component({
  selector: 'app-event-card',
  imports: [RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCard {
  readonly eventDetail = input.required<EventDetail>();

  protected readonly labels = appLabels.shared.eventCard;
  protected readonly lowestTicketType = computed(() => this.findLowestTicketType(this.eventDetail().ticketTypes));
  protected readonly availableTickets = computed(() => {
    const ticketType = this.lowestTicketType();

    return ticketType ? Math.max(ticketType.quantityTotal - ticketType.quantitySold, 0) : 0;
  });
  protected readonly eventDate = computed(() => new Intl.DateTimeFormat('es-VE', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(this.eventDetail().event.startsAt)));
  protected readonly categoryLabel = computed(() => this.labels.categories[this.eventDetail().event.category]);

  protected formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat('es-VE', {
      currency,
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(value);
  }

  private findLowestTicketType(ticketTypes: TicketType[]): TicketType | undefined {
    return ticketTypes
      .filter((ticketType) => ticketType.status === 'active')
      .sort((first, second) => first.price - second.price)[0];
  }
}
