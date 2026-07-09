import { calculateOrderTotals, PLATFORM_FEE_RATE } from './checkout-pricing';

describe('calculateOrderTotals', () => {
  it('calculates subtotal, platform fees and total', () => {
    const totals = calculateOrderTotals([
      { quantity: 2, unitPrice: 35, currency: 'USD' },
      { quantity: 1, unitPrice: 75, currency: 'USD' },
    ]);

    expect(PLATFORM_FEE_RATE).toBe(0.08);
    expect(totals).toEqual({
      subtotal: 145,
      fees: 11.6,
      total: 156.6,
      currency: 'USD',
    });
  });

  it('defaults to USD when no items are selected', () => {
    expect(calculateOrderTotals([])).toEqual({
      subtotal: 0,
      fees: 0,
      total: 0,
      currency: 'USD',
    });
  });
});
