import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { appLabels } from '../../../../../core/content/app-labels';

type CheckoutLabels = typeof appLabels.checkout;

@Component({
  selector: 'app-checkout-buyer-form',
  imports: [],
  templateUrl: './checkout-buyer-form.html',
  styleUrl: './checkout-buyer-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutBuyerForm {
  readonly labels = input.required<CheckoutLabels>();
  readonly buyerName = input.required<string>();
  readonly buyerEmail = input.required<string>();
  readonly buyerPhone = input.required<string>();
  readonly buyerNameError = input<string | null>(null);
  readonly buyerEmailError = input<string | null>(null);

  readonly buyerNameChange = output<string>();
  readonly buyerEmailChange = output<string>();
  readonly buyerPhoneChange = output<string>();

  protected updateBuyerName(event: Event): void {
    this.buyerNameChange.emit((event.target as HTMLInputElement).value);
  }

  protected updateBuyerEmail(event: Event): void {
    this.buyerEmailChange.emit((event.target as HTMLInputElement).value);
  }

  protected updateBuyerPhone(event: Event): void {
    this.buyerPhoneChange.emit((event.target as HTMLInputElement).value);
  }
}
