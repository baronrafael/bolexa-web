import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { appLabels } from '../../../core/content/app-labels';
import { Event, Ticket, TicketType, Venue } from '../../../data-access/models';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-qr-ticket-card',
  imports: [StatusBadge],
  templateUrl: './qr-ticket-card.html',
  styleUrl: './qr-ticket-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrTicketCard {
  readonly ticket = input.required<Ticket>();
  readonly event = input<Event>();
  readonly venue = input<Venue>();
  readonly ticketType = input<TicketType>();

  protected readonly labels = appLabels.shared.qrTicketCard;
  protected readonly brand = appLabels.brand.name;
}
