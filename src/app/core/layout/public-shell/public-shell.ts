import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DemoRoleSwitcher } from '../../auth/demo-role-switcher/demo-role-switcher';

@Component({
  selector: 'app-public-shell',
  imports: [DemoRoleSwitcher, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicShell {
  protected readonly navLinks = [
    { label: 'Eventos', path: '/events' },
    { label: 'Mis tickets', path: '/my-tickets' },
    { label: 'Organizador', path: '/organizer/dashboard' },
    { label: 'Scanner', path: '/scan/events' },
  ];
}
