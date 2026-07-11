import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DemoRoleSwitcher } from '../../auth/demo-role-switcher/demo-role-switcher';
import { MockAuth } from '../../auth/mock-auth';
import { appLabels } from '../../content/app-labels';
import { DemoControls } from '../../demo/demo-controls/demo-controls';

@Component({
  selector: 'app-public-shell',
  imports: [DemoControls, DemoRoleSwitcher, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicShell {
  protected readonly labels = appLabels;
  protected readonly auth = inject(MockAuth);

  protected readonly navLinks = [
    { label: appLabels.navigation.publicLinks.events, path: '/events' },
    { label: appLabels.navigation.publicLinks.myTickets, path: '/my-tickets' },
    { label: appLabels.navigation.publicLinks.profile, path: '/profile' },
  ];
}
