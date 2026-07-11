import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { MockAuth } from '../mock-auth';
import { UserRole } from '../../../data-access/models';
import { appLabels } from '../../content/app-labels';

@Component({
  selector: 'app-demo-role-switcher',
  imports: [],
  templateUrl: './demo-role-switcher.html',
  styleUrl: './demo-role-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoRoleSwitcher {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly labels = appLabels;
  protected readonly auth = inject(MockAuth);
  protected readonly isOpen = signal(false);

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

  protected roleLabel(role: UserRole): string {
    return this.labels.auth.roleLabels[role];
  }

  protected toggleMenu(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isOpen.set(false);
  }

  protected switchUser(userId: string): void {
    this.auth.switchUser(userId);
    this.closeMenu();
  }
}
