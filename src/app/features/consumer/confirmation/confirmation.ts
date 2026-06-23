import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { appLabels } from '../../../core/content/app-labels';
import { EventDetail, Order, OrderItem, PaymentMethod, Ticket } from '../../../data-access/models';
import { CheckoutRepository } from '../../../data-access/repositories/checkout-repository';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { EmptyState, LoadingState, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-confirmation',
  imports: [EmptyState, LoadingState, RouterLink, StatusBadge],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Confirmation {
  private readonly route = inject(ActivatedRoute);
  private readonly checkoutRepository = inject(CheckoutRepository);
  private readonly eventsRepository = inject(EventsRepository);
  private readonly routeParams = toSignal(this.route.paramMap);

  protected readonly labels = appLabels;
  protected readonly order = signal<Order | null>(null);
  protected readonly orderItems = signal<OrderItem[]>([]);
  protected readonly tickets = signal<Ticket[]>([]);
  protected readonly eventDetail = signal<EventDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly isPaid = computed(() => this.order()?.status === 'paid');
  protected readonly eyebrow = computed(() => this.isPaid() ? this.labels.confirmation.paidEyebrow : this.labels.confirmation.manualReviewEyebrow);
  protected readonly title = computed(() => this.isPaid() ? this.labels.confirmation.paidTitle : this.labels.confirmation.manualReviewTitle);
  protected readonly description = computed(() => this.isPaid() ? this.labels.confirmation.paidDescription : this.labels.confirmation.manualReviewDescription);
  protected readonly paymentMethodLabel = computed(() => {
    const paymentMethod = this.order()?.paymentMethod;

    return paymentMethod ? this.labels.checkout.paymentMethods[paymentMethod as PaymentMethod] : '-';
  });

  constructor() {
    effect(() => {
      const orderId = this.routeParams()?.get('orderId');

      if (orderId) {
        void this.loadConfirmation(orderId);
      }
    });
  }

  protected ticketTypeName(ticketTypeId: string): string {
    return this.eventDetail()?.ticketTypes.find((ticketType) => ticketType.id === ticketTypeId)?.name ?? ticketTypeId;
  }

  protected formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat('es-VE', {
      currency,
      style: 'currency',
    }).format(value);
  }

  private async loadConfirmation(orderId: string): Promise<void> {
    this.loading.set(true);

    try {
      const order = await this.checkoutRepository.getOrder(orderId);
      this.order.set(order);

      if (!order) {
        this.orderItems.set([]);
        this.tickets.set([]);
        this.eventDetail.set(null);
        return;
      }

      const [items, tickets, eventDetail] = await Promise.all([
        this.checkoutRepository.getOrderItems(order.id),
        this.checkoutRepository.getOrderTickets(order.id),
        this.eventsRepository.getEventById(order.eventId),
      ]);

      this.orderItems.set(items);
      this.tickets.set(tickets);
      this.eventDetail.set(eventDetail);
    } finally {
      this.loading.set(false);
    }
  }
}
