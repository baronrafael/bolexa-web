import { Currency } from '../models';

export const PLATFORM_FEE_RATE = 0.08;

export interface CheckoutPricingItem {
  quantity: number;
  unitPrice: number;
  currency?: Currency;
}

export interface CheckoutTotals {
  subtotal: number;
  fees: number;
  total: number;
  currency: Currency;
}

export function calculateOrderTotals(items: CheckoutPricingItem[]): CheckoutTotals {
  const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const fees = Number((subtotal * PLATFORM_FEE_RATE).toFixed(2));

  return {
    subtotal,
    fees,
    total: Number((subtotal + fees).toFixed(2)),
    currency: items[0]?.currency ?? 'USD',
  };
}
