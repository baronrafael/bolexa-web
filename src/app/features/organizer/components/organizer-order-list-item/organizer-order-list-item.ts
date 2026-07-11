import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { appLabels } from '../../../../core/content/app-labels';
import { OrganizerOrder } from '../../../../data-access/repositories/organizer-repository';
import { StatusBadge } from '../../../../shared/ui';

type OrganizerOrdersLabels = typeof appLabels.organizerOrders;

@Component({
  selector: 'app-organizer-order-list-item',
  imports: [StatusBadge],
  templateUrl: './organizer-order-list-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizerOrderListItem {
  readonly entry = input.required<OrganizerOrder>();
  readonly labels = input.required<OrganizerOrdersLabels>();
  readonly paymentMethodLabel = input.required<string>();
  readonly ticketCount = input.required<number>();
  readonly itemCount = input.required<number>();
  readonly formattedTotal = input.required<string>();
  readonly formattedDate = input.required<string>();
}
