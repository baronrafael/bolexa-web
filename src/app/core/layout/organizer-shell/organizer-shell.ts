import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DemoRoleSwitcher } from '../../auth/demo-role-switcher/demo-role-switcher';
import { appLabels } from '../../content/app-labels';
import { DemoControls } from '../../demo/demo-controls/demo-controls';

@Component({
  selector: 'app-organizer-shell',
  imports: [DemoControls, DemoRoleSwitcher, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './organizer-shell.html',
  styleUrl: './organizer-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizerShell {
  protected readonly labels = appLabels;
  protected readonly navLinks = [
    { label: appLabels.navigation.organizerLinks.dashboard, path: '/organizer/dashboard' },
    { label: appLabels.navigation.organizerLinks.events, path: '/organizer/events' },
    { label: appLabels.navigation.organizerLinks.orders, path: '/organizer/events/event-caracas-music-fest/orders' },
    { label: appLabels.navigation.organizerLinks.attendees, path: '/organizer/events/event-caracas-music-fest/attendees' },
    { label: appLabels.navigation.organizerLinks.reports, path: '/organizer/events/event-caracas-music-fest/reports' },
  ];
}
