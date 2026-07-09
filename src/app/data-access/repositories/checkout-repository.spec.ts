import { TestBed } from '@angular/core/testing';
import { MockDatabase } from '../mock/mock-database';
import { CheckoutRepository } from './checkout-repository';

describe('CheckoutRepository', () => {
  let database: MockDatabase;
  let repository: CheckoutRepository;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    database = TestBed.inject(MockDatabase);
    repository = TestBed.inject(CheckoutRepository);
    database.reset();
  });

  it('issues tickets and updates sold count when an order is approved', async () => {
    const order = await repository.createOrder({
      eventId: 'event-caracas-music-fest',
      userId: 'user-andrea',
      buyerName: 'Comprador Test',
      buyerEmail: 'comprador@example.com',
      items: [{ ticketTypeId: 'tt-cmf-general', quantity: 2 }],
    });

    const payment = await repository.payOrder({
      orderId: order.id,
      paymentMethod: 'pago_movil',
      paymentReference: 'PM-TEST',
      result: 'approved',
    });
    const ticketType = database
      .snapshot()
      .ticketTypes.find((candidate) => candidate.id === 'tt-cmf-general');

    expect(payment.order.status).toBe('paid');
    expect(payment.tickets).toHaveLength(2);
    expect(payment.tickets.every((ticket) => ticket.holderName === 'Comprador Test')).toBe(true);
    expect(ticketType?.quantitySold).toBe(86);
  });

  it('rejects orders that exceed available inventory', async () => {
    await expect(
      repository.createOrder({
        eventId: 'event-caracas-music-fest',
        userId: 'user-andrea',
        items: [{ ticketTypeId: 'tt-cmf-general', quantity: 2000 }],
      }),
    ).rejects.toThrow('Not enough tickets available.');
  });
});
