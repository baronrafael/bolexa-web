import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { appLabels } from '../../content/app-labels';
import { MockDatabase } from '../../../data-access/mock/mock-database';

@Component({
  selector: 'app-demo-controls',
  imports: [RouterLink],
  templateUrl: './demo-controls.html',
  styleUrl: './demo-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoControls {
  private readonly database = inject(MockDatabase);
  private readonly router = inject(Router);

  protected readonly labels = appLabels.demo;
  protected readonly resetDone = signal(false);
  protected readonly demoLinks = [
    { label: appLabels.demo.links.event, path: '/events/caracas-music-fest' },
    { label: appLabels.demo.links.tickets, path: '/my-tickets' },
    { label: appLabels.demo.links.scanner, path: '/scan/events/event-caracas-music-fest/scanner' },
    { label: appLabels.demo.links.dashboard, path: '/organizer/dashboard' },
  ];

  protected resetDemoData(): void {
    this.database.reset();
    this.resetDone.set(true);
    void this.router.navigateByUrl('/');
  }
}
