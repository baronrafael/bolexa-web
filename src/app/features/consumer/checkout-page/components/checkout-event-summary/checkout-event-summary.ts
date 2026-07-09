import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EventDetail } from '../../../../../data-access/models';
import { StatusBadge } from '../../../../../shared/ui';

@Component({
  selector: 'app-checkout-event-summary',
  imports: [StatusBadge],
  templateUrl: './checkout-event-summary.html',
  styleUrl: './checkout-event-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutEventSummary {
  readonly detail = input.required<EventDetail>();
  readonly title = input.required<string>();
  readonly eventDate = input.required<string>();
}
