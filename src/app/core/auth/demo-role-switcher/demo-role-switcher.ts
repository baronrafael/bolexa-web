import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  protected readonly labels = appLabels;
  protected readonly auth = inject(MockAuth);

  protected roleLabel(role: UserRole): string {
    return this.labels.auth.roleLabels[role];
  }
}
