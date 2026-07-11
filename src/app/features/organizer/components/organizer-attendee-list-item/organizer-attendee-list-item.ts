import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { appLabels } from '../../../../core/content/app-labels';
import { Attendee } from '../../../../data-access/models';
import { StatusBadge } from '../../../../shared/ui';

type OrganizerAttendeesLabels = typeof appLabels.organizerAttendees;

@Component({
  selector: 'app-organizer-attendee-list-item',
  imports: [StatusBadge],
  templateUrl: './organizer-attendee-list-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizerAttendeeListItem {
  readonly attendee = input.required<Attendee>();
  readonly labels = input.required<OrganizerAttendeesLabels>();
  readonly checkInLabel = input.required<string>();
}
