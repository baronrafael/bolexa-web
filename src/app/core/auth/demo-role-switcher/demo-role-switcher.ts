import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MockAuth } from '../mock-auth';
import { UserRole } from '../../../data-access/models';

@Component({
  selector: 'app-demo-role-switcher',
  imports: [],
  templateUrl: './demo-role-switcher.html',
  styleUrl: './demo-role-switcher.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoRoleSwitcher {
  protected readonly auth = inject(MockAuth);

  protected roleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      consumer: 'Comprador',
      organizer: 'Organizador',
      scanner: 'Scanner',
      admin: 'Admin',
    };

    return labels[role];
  }
}
