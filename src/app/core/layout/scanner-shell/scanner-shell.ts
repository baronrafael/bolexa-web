import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DemoRoleSwitcher } from '../../auth/demo-role-switcher/demo-role-switcher';

@Component({
  selector: 'app-scanner-shell',
  imports: [DemoRoleSwitcher, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './scanner-shell.html',
  styleUrl: './scanner-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScannerShell {
  protected readonly navLinks = [
    { label: 'Eventos', path: '/scan/events' },
    { label: 'Scanner', path: '/scan/events/event-caracas-music-fest/scanner' },
    { label: 'Asistentes', path: '/scan/events/event-caracas-music-fest/attendees' },
    { label: 'Stats', path: '/scan/events/event-caracas-music-fest/stats' },
  ];
}
