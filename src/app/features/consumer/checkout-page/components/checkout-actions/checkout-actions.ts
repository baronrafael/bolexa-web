import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { appLabels } from '../../../../../core/content/app-labels';

type CheckoutLabels = typeof appLabels.checkout;

@Component({
  selector: 'app-checkout-actions',
  imports: [],
  templateUrl: './checkout-actions.html',
  styleUrl: './checkout-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutActions {
  readonly labels = input.required<CheckoutLabels>();
  readonly selectedCount = input.required<number>();
  readonly processing = input.required<boolean>();
  readonly showNoTicketsWarning = input(false);

  readonly approve = output<void>();
  readonly requestManualReview = output<void>();

  protected readonly isDisabled = computed(() => this.selectedCount() === 0 || this.processing());
}
