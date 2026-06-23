import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DemoRoleSwitcher } from '../../auth/demo-role-switcher/demo-role-switcher';
import { appLabels } from '../../content/app-labels';

@Component({
  selector: 'app-scanner-shell',
  imports: [DemoRoleSwitcher, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './scanner-shell.html',
  styleUrl: './scanner-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScannerShell {
  protected readonly labels = appLabels;
  protected readonly navLinks = [
    { label: appLabels.navigation.scannerLinks.events, path: '/scan/events' },
    { label: appLabels.navigation.scannerLinks.scanner, path: '/scan/events/event-caracas-music-fest/scanner' },
    { label: appLabels.navigation.scannerLinks.attendees, path: '/scan/events/event-caracas-music-fest/attendees' },
    { label: appLabels.navigation.scannerLinks.stats, path: '/scan/events/event-caracas-music-fest/stats' },
  ];
}
