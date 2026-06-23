import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { appLabels } from '../../../core/content/app-labels';
import { Currency } from '../../../data-access/models';

export interface OrderSummaryItem {
  label: string;
  quantity: number;
  unitPrice: number;
  currency: Currency;
}

@Component({
  selector: 'app-order-summary',
  imports: [],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummary {
  readonly items = input<OrderSummaryItem[]>([]);
  readonly fees = input(0, { transform: numberAttribute });
  readonly currency = input<Currency>('USD');

  protected readonly labels = appLabels.shared.orderSummary;
  protected readonly subtotal = computed(() => this.items().reduce((total, item) => total + item.quantity * item.unitPrice, 0));
  protected readonly total = computed(() => this.subtotal() + this.fees());

  protected formatMoney(value: number, currency = this.currency()): string {
    return new Intl.NumberFormat('es-VE', {
      currency,
      style: 'currency',
    }).format(value);
  }
}
