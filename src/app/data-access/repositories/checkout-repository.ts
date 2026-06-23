import { inject, Injectable } from '@angular/core';
import { CreateOrderInput, Order, OrderItem, PayOrderInput, Ticket } from '../models';
import { MockDatabase } from '../mock/mock-database';
import { clone, createMockId, mockDelay, nowIso } from '../mock/mock-helpers';

@Injectable({
  providedIn: 'root',
})
export class CheckoutRepository {
  private readonly database = inject(MockDatabase);
  private readonly platformFeeRate = 0.08;

  async createOrder(input: CreateOrderInput): Promise<Order> {
    await mockDelay();

    const state = this.database.snapshot();
    const ticketTypes = input.items.map((item) => {
      const ticketType = state.ticketTypes.find((candidate) => candidate.id === item.ticketTypeId && candidate.eventId === input.eventId);

      if (!ticketType || ticketType.status !== 'active') {
        throw new Error('Ticket type is not available.');
      }

      if (ticketType.quantityTotal - ticketType.quantitySold < item.quantity) {
        throw new Error('Not enough tickets available.');
      }

      return { item, ticketType };
    });

    const subtotal = ticketTypes.reduce((total, { item, ticketType }) => total + ticketType.price * item.quantity, 0);
    const fees = Number((subtotal * this.platformFeeRate).toFixed(2));
    const now = nowIso();
    const orderId = createMockId('order');
    const order: Order = {
      id: orderId,
      userId: input.userId,
      eventId: input.eventId,
      status: 'pending',
      subtotal,
      fees,
      total: Number((subtotal + fees).toFixed(2)),
      currency: ticketTypes[0]?.ticketType.currency ?? 'USD',
      createdAt: now,
      updatedAt: now,
    };

    this.database.update((nextState) => {
      nextState.orders.push(order);
      for (const { item, ticketType } of ticketTypes) {
        nextState.orderItems.push({
          id: createMockId('order_item'),
          orderId,
          ticketTypeId: ticketType.id,
          quantity: item.quantity,
          unitPrice: ticketType.price,
          currency: ticketType.currency,
          createdAt: now,
        });
      }
    });

    return clone(order);
  }

  async payOrder(input: PayOrderInput): Promise<{ order: Order; tickets: Ticket[] }> {
    await mockDelay();

    let paidOrder: Order | undefined;
    let issuedTickets: Ticket[] = [];

    this.database.update((state) => {
      const order = state.orders.find((candidate) => candidate.id === input.orderId);

      if (!order) {
        throw new Error('Order not found.');
      }

      const now = nowIso();
      order.paymentMethod = input.paymentMethod;
      order.paymentReference = input.paymentReference;
      order.status = input.result === 'approved' ? 'paid' : input.result;
      order.updatedAt = now;

      if (input.result === 'approved') {
        const user = state.users.find((candidate) => candidate.id === order.userId);
        const orderItems = state.orderItems.filter((item) => item.orderId === order.id);

        for (const item of orderItems) {
          const ticketType = state.ticketTypes.find((candidate) => candidate.id === item.ticketTypeId);

          if (!ticketType) {
            continue;
          }

          ticketType.quantitySold += item.quantity;
          ticketType.updatedAt = now;

          for (let index = 0; index < item.quantity; index += 1) {
            const ticketId = createMockId('ticket');
            const ticket: Ticket = {
              id: ticketId,
              orderId: order.id,
              eventId: order.eventId,
              ticketTypeId: item.ticketTypeId,
              userId: order.userId,
              holderName: user?.name ?? 'Invitado Bolexa',
              holderEmail: user?.email ?? 'invitado@bolexa.example.com',
              qrCode: `BLX-${ticketId.toUpperCase()}`,
              status: 'valid',
              createdAt: now,
              updatedAt: now,
            };

            state.tickets.push(ticket);
            issuedTickets.push(ticket);
          }
        }
      }

      paidOrder = order;
    });

    if (!paidOrder) {
      throw new Error('Order not found.');
    }

    return {
      order: clone(paidOrder),
      tickets: clone(issuedTickets),
    };
  }

  async getOrder(orderId: string): Promise<Order | null> {
    await mockDelay();

    const order = this.database.snapshot().orders.find((candidate) => candidate.id === orderId);

    return order ? clone(order) : null;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    await mockDelay();

    return this.database
      .snapshot()
      .orderItems
      .filter((item) => item.orderId === orderId)
      .map((item) => clone(item));
  }

  async getOrderTickets(orderId: string): Promise<Ticket[]> {
    await mockDelay();

    return this.database
      .snapshot()
      .tickets
      .filter((ticket) => ticket.orderId === orderId)
      .map((ticket) => clone(ticket));
  }
}
