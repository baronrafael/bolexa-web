import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { appLabels } from '../../../../../core/content/app-labels';
import { PaymentMethod } from '../../../../../data-access/models';

export type PaymentOption = Exclude<PaymentMethod, 'card'> | 'card';
type CheckoutLabels = typeof appLabels.checkout;

@Component({
  selector: 'app-checkout-payment-method-selector',
  imports: [],
  templateUrl: './checkout-payment-method-selector.html',
  styleUrl: './checkout-payment-method-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPaymentMethodSelector {
  readonly labels = input.required<CheckoutLabels>();
  readonly paymentOptions = input.required<PaymentOption[]>();
  readonly paymentMethod = input.required<PaymentOption>();
  readonly paymentReference = input.required<string>();
  readonly paymentReferenceError = input<string | null>(null);

  readonly paymentMethodChange = output<PaymentOption>();
  readonly paymentReferenceChange = output<string>();

  protected readonly selectedPaymentClass =
    'rounded-2xl border border-primary/50 bg-primary/10 p-4 text-left transition hover:border-primary/60';
  protected readonly unselectedPaymentClass =
    'rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-primary/40';
  protected readonly selectedPaymentDescription = computed(
    () => this.labels().methodDescriptions[this.paymentMethod()],
  );

  protected paymentOptionClass(method: PaymentOption): string {
    return this.paymentMethod() === method
      ? this.selectedPaymentClass
      : this.unselectedPaymentClass;
  }

  protected updatePaymentReference(event: Event): void {
    this.paymentReferenceChange.emit((event.target as HTMLInputElement).value);
  }
}
