import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { appLabels } from '../../../../core/content/app-labels';
import { EventDetail } from '../../../../data-access/models';
import { StatusBadge } from '../../../../shared/ui';

type OrganizerEventsLabels = typeof appLabels.organizerEvents;

@Component({
  selector: 'app-organizer-event-list-item',
  imports: [RouterLink, StatusBadge],
  templateUrl: './organizer-event-list-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizerEventListItem {
  readonly detail = input.required<EventDetail>();
  readonly labels = input.required<OrganizerEventsLabels>();
  readonly formattedDate = input.required<string>();
  readonly ticketsSold = input.required<number>();
  readonly revenue = input.required<string>();
}
