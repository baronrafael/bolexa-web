import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MockAuth } from '../../auth/mock-auth';
import { appLabels } from '../../content/app-labels';
import { MockDatabase } from '../../../data-access/mock/mock-database';

interface DemoLink {
  label: string;
  path: string;
  queryParams?: { qr: string };
}

@Component({
  selector: 'app-demo-controls',
  imports: [RouterLink],
  templateUrl: './demo-controls.html',
  styleUrl: './demo-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoControls {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly auth = inject(MockAuth);
  private readonly database = inject(MockDatabase);
  private readonly router = inject(Router);

  protected readonly labels = appLabels.demo;
  protected readonly isOpen = signal(false);
  protected readonly resetDone = signal(false);
  protected readonly copyDone = signal(false);
  protected readonly demoLinks: DemoLink[] = [
    { label: appLabels.demo.links.event, path: '/events/caracas-music-fest' },
    { label: appLabels.demo.links.tickets, path: '/my-tickets' },
    {
      label: appLabels.demo.links.scanner,
      path: '/scan/events/event-caracas-music-fest/scanner',
      queryParams: { qr: appLabels.demo.qrValue },
    },
    { label: appLabels.demo.links.dashboard, path: '/organizer/dashboard' },
  ];

  @HostListener('document:click', ['$event.target'])
  protected closeOnOutsideClick(target: EventTarget | null): void {
    if (target instanceof Node && this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    this.closeMenu();
  }

  protected toggleMenu(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isOpen.set(false);
  }

  protected copyQrCode(): void {
    this.copyDone.set(false);

    const write = navigator.clipboard?.writeText(this.labels.qrValue);

    if (write) {
      void write.finally(() => this.copyDone.set(true));
      return;
    }

    this.copyDone.set(true);
  }

  protected resetDemoData(): void {
    this.closeMenu();
    this.database.reset();
    this.auth.resetDemoUser();
    this.resetDone.set(true);
    void this.router.navigateByUrl('/');
  }
}
