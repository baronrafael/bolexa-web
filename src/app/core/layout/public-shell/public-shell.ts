import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DemoRoleSwitcher } from '../../auth/demo-role-switcher/demo-role-switcher';
import { appLabels } from '../../content/app-labels';

@Component({
  selector: 'app-public-shell',
  imports: [DemoRoleSwitcher, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicShell {
  protected readonly labels = appLabels;
  protected readonly navLinks = [
    { label: appLabels.navigation.publicLinks.events, path: '/events' },
    { label: appLabels.navigation.publicLinks.myTickets, path: '/my-tickets' },
    { label: appLabels.navigation.publicLinks.organizer, path: '/organizer/dashboard' },
    { label: appLabels.navigation.publicLinks.scanner, path: '/scan/events' },
  ];
}
