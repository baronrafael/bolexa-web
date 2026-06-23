import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DemoRoleSwitcher } from '../../auth/demo-role-switcher/demo-role-switcher';

@Component({
  selector: 'app-organizer-shell',
  imports: [DemoRoleSwitcher, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './organizer-shell.html',
  styleUrl: './organizer-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizerShell {
  protected readonly navLinks = [
    { label: 'Dashboard', path: '/organizer/dashboard' },
    { label: 'Eventos', path: '/organizer/events' },
    { label: 'Ordenes', path: '/organizer/events/event-caracas-music-fest/orders' },
    { label: 'Asistentes', path: '/organizer/events/event-caracas-music-fest/attendees' },
    { label: 'Reportes', path: '/organizer/events/event-caracas-music-fest/reports' },
  ];
}
