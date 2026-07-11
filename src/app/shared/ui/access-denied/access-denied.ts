import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserRole } from '../../../data-access/models';
import { appLabels } from '../../../core/content/app-labels';

@Component({
  selector: 'app-access-denied',
  imports: [RouterLink],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDenied {
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly labels = appLabels.accessDenied;

  protected readonly description = computed(() => {
    const requiredRole = this.queryParams().get('requiredRole') as UserRole | null;

    if (requiredRole === 'consumer') {
      return this.labels.descriptions.consumer;
    }

    if (requiredRole === 'organizer') {
      return this.labels.descriptions.organizer;
    }

    if (requiredRole === 'scanner') {
      return this.labels.descriptions.scanner;
    }

    if (requiredRole === 'admin') {
      return this.labels.descriptions.admin;
    }

    return this.labels.descriptions.fallback;
  });

  protected readonly showSellAction = computed(
    () => this.queryParams().get('requiredRole') === 'organizer',
  );

  protected readonly showEventsAction = computed(() => {
    const requiredRole = this.queryParams().get('requiredRole');

    return (
      requiredRole === 'consumer' ||
      requiredRole === 'scanner' ||
      requiredRole === 'organizer'
    );
  });
}
