import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { EventDetail, PaymentMethod } from '../../../data-access/models';
import { CheckoutRepository } from '../../../data-access/repositories/checkout-repository';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { EmptyState, LoadingState, OrderSummary, OrderSummaryItem, StatusBadge, TicketTypeSelector } from '../../../shared/ui';

type PaymentOption = Exclude<PaymentMethod, 'card'> | 'card';

@Component({
  selector: 'app-checkout-page',
  imports: [EmptyState, LoadingState, OrderSummary, RouterLink, StatusBadge, TicketTypeSelector],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(MockAuth);
  private readonly eventsRepository = inject(EventsRepository);
  private readonly checkoutRepository = inject(CheckoutRepository);
  private readonly routeParams = toSignal(this.route.paramMap);

  protected readonly labels = appLabels;
  protected readonly eventDetail = signal<EventDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly processing = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly quantities = signal<Record<string, number>>({});
  protected readonly buyerName = signal(this.auth.currentUser().name);
  protected readonly buyerEmail = signal(this.auth.currentUser().email);
  protected readonly buyerPhone = signal(this.auth.currentUser().phone ?? '');
  protected readonly paymentMethod = signal<PaymentOption>('pago_movil');
  protected readonly paymentReference = signal('');
  protected readonly selectedPaymentClass = 'rounded-2xl border border-primary/50 bg-primary/10 p-4 text-left transition hover:border-primary/60';
  protected readonly unselectedPaymentClass = 'rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-primary/40';
  protected readonly paymentOptions: PaymentOption[] = ['pago_movil', 'zelle', 'binance', 'bank_transfer', 'manual', 'card'];
  protected readonly selectedItems = computed<OrderSummaryItem[]>(() => {
    const eventDetail = this.eventDetail();

    if (!eventDetail) {
      return [];
    }

    return eventDetail.ticketTypes
      .map((ticketType) => ({
        currency: ticketType.currency,
        label: ticketType.name,
        quantity: this.quantities()[ticketType.id] ?? 0,
        unitPrice: ticketType.price,
      }))
      .filter((item) => item.quantity > 0);
  });
  protected readonly selectedCount = computed(() => this.selectedItems().reduce((total, item) => total + item.quantity, 0));
  protected readonly subtotal = computed(() => this.selectedItems().reduce((total, item) => total + item.quantity * item.unitPrice, 0));
  protected readonly fees = computed(() => Number((this.subtotal() * 0.08).toFixed(2)));
  protected readonly total = computed(() => this.subtotal() + this.fees());
  protected readonly selectedCurrency = computed(() => this.selectedItems()[0]?.currency ?? 'USD');
  protected readonly selectedPaymentDescription = computed(() => this.labels.checkout.methodDescriptions[this.paymentMethod()]);
  protected readonly eventDate = computed(() => {
    const eventDetail = this.eventDetail();

    return eventDetail
      ? new Intl.DateTimeFormat('es-VE', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(eventDetail.event.startsAt))
      : '';
  });

  constructor() {
    effect(() => {
      const eventId = this.routeParams()?.get('eventId');

      if (eventId) {
        void this.loadCheckout(eventId);
      }
    });
  }

  protected updateQuantity(ticketTypeId: string, quantity: number): void {
    this.quantities.update((currentQuantities) => ({
      ...currentQuantities,
      [ticketTypeId]: quantity,
    }));
  }

  protected quantityFor(ticketTypeId: string): number {
    return this.quantities()[ticketTypeId] ?? 0;
  }

  protected updateBuyerName(event: Event): void {
    this.buyerName.set((event.target as HTMLInputElement).value);
  }

  protected updateBuyerEmail(event: Event): void {
    this.buyerEmail.set((event.target as HTMLInputElement).value);
  }

  protected updateBuyerPhone(event: Event): void {
    this.buyerPhone.set((event.target as HTMLInputElement).value);
  }

  protected updatePaymentMethod(method: PaymentOption): void {
    this.paymentMethod.set(method);
  }

  protected paymentOptionClass(method: PaymentOption): string {
    return this.paymentMethod() === method ? this.selectedPaymentClass : this.unselectedPaymentClass;
  }

  protected formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat('es-VE', {
      currency,
      style: 'currency',
    }).format(value);
  }

  protected updatePaymentReference(event: Event): void {
    this.paymentReference.set((event.target as HTMLInputElement).value);
  }

  protected async submit(result: 'approved' | 'manual_review'): Promise<void> {
    const eventDetail = this.eventDetail();

    if (!eventDetail || this.selectedCount() === 0 || this.processing()) {
      return;
    }

    this.processing.set(true);
    this.error.set(null);

    try {
      const order = await this.checkoutRepository.createOrder({
        eventId: eventDetail.event.id,
        userId: this.auth.currentUser().id,
        items: eventDetail.ticketTypes
          .map((ticketType) => ({
            quantity: this.quantities()[ticketType.id] ?? 0,
            ticketTypeId: ticketType.id,
          }))
          .filter((item) => item.quantity > 0),
      });

      const payment = await this.checkoutRepository.payOrder({
        orderId: order.id,
        paymentMethod: this.paymentMethod(),
        paymentReference: this.paymentReference(),
        result,
      });

      await this.router.navigate(['/checkout', eventDetail.event.id, 'confirmation', payment.order.id]);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : this.labels.checkout.errorTitle);
    } finally {
      this.processing.set(false);
    }
  }

  private async loadCheckout(eventId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.quantities.set({});

    try {
      const eventDetail = await this.eventsRepository.getEventById(eventId);
      this.eventDetail.set(eventDetail);

      const firstAvailableTicketType = eventDetail?.ticketTypes.find((ticketType) => ticketType.status === 'active' && ticketType.quantityTotal > ticketType.quantitySold);

      if (firstAvailableTicketType) {
        this.quantities.set({ [firstAvailableTicketType.id]: 1 });
      }
    } finally {
      this.loading.set(false);
    }
  }
}
