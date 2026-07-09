import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { calculateOrderTotals } from '../../../data-access/pricing/checkout-pricing';
import { EventDetail, PaymentMethod } from '../../../data-access/models';
import { CheckoutRepository } from '../../../data-access/repositories/checkout-repository';
import { EventsRepository } from '../../../data-access/repositories/events-repository';
import { formatDateEsVe, formatMoneyEsVe } from '../../../shared/formatting/formatters';
import { createAsyncPageState } from '../../../shared/state/async-page-state';
import {
  EmptyState,
  LoadingState,
  OrderSummary,
  OrderSummaryItem,
  StatusBadge,
  TicketTypeSelector,
} from '../../../shared/ui';

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
  private readonly routeQueryParams = toSignal(this.route.queryParamMap);
  private readonly pageState = createAsyncPageState();

  protected readonly labels = appLabels;
  protected readonly eventDetail = signal<EventDetail | null>(null);
  protected readonly loading = this.pageState.loading;
  protected readonly processing = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly quantities = signal<Record<string, number>>({});
  protected readonly buyerName = signal(this.auth.currentUser().name);
  protected readonly buyerEmail = signal(this.auth.currentUser().email);
  protected readonly buyerPhone = signal(this.auth.currentUser().phone ?? '');
  protected readonly paymentMethod = signal<PaymentOption>('pago_movil');
  protected readonly paymentReference = signal('');
  protected readonly selectedPaymentClass =
    'rounded-2xl border border-primary/50 bg-primary/10 p-4 text-left transition hover:border-primary/60';
  protected readonly unselectedPaymentClass =
    'rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-primary/40';
  protected readonly paymentOptions: PaymentOption[] = [
    'pago_movil',
    'zelle',
    'binance',
    'bank_transfer',
    'manual',
    'card',
  ];
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
  protected readonly selectedCount = computed(() =>
    this.selectedItems().reduce((total, item) => total + item.quantity, 0),
  );
  protected readonly totals = computed(() => calculateOrderTotals(this.selectedItems()));
  protected readonly subtotal = computed(() => this.totals().subtotal);
  protected readonly fees = computed(() => this.totals().fees);
  protected readonly total = computed(() => this.totals().total);
  protected readonly selectedCurrency = computed(() => this.totals().currency);
  protected readonly selectedPaymentDescription = computed(
    () => this.labels.checkout.methodDescriptions[this.paymentMethod()],
  );
  protected readonly requiresPaymentReference = computed(
    () => this.paymentMethod() !== 'manual' && this.paymentMethod() !== 'card',
  );
  protected readonly buyerNameError = computed(() =>
    this.buyerName().trim() ? null : this.labels.checkout.validation.nameRequired,
  );
  protected readonly buyerEmailError = computed(() => {
    const email = this.buyerEmail().trim();

    if (!email) {
      return this.labels.checkout.validation.emailRequired;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? null
      : this.labels.checkout.validation.emailInvalid;
  });
  protected readonly paymentReferenceError = computed(() =>
    this.requiresPaymentReference() && !this.paymentReference().trim()
      ? this.labels.checkout.validation.referenceRequired
      : null,
  );
  protected readonly isFormValid = computed(
    () => !this.buyerNameError() && !this.buyerEmailError() && !this.paymentReferenceError(),
  );
  protected readonly eventDate = computed(() => {
    const eventDetail = this.eventDetail();

    return eventDetail
      ? formatDateEsVe(eventDetail.event.startsAt, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '';
  });

  constructor() {
    effect(() => {
      const eventId = this.routeParams()?.get('eventId');
      const queryParams = this.routeQueryParams();

      if (eventId && queryParams) {
        void this.loadCheckout(eventId, queryParams);
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
    return this.paymentMethod() === method
      ? this.selectedPaymentClass
      : this.unselectedPaymentClass;
  }

  protected formatMoney(value: number, currency: string): string {
    return formatMoneyEsVe(value, currency);
  }

  protected updatePaymentReference(event: Event): void {
    this.paymentReference.set((event.target as HTMLInputElement).value);
  }

  protected displayError(errorMessage: string | null): string | null {
    return this.submitted() ? errorMessage : null;
  }

  protected async submit(result: 'approved' | 'manual_review'): Promise<void> {
    this.submitted.set(true);
    const eventDetail = this.eventDetail();

    if (!eventDetail || this.selectedCount() === 0 || !this.isFormValid() || this.processing()) {
      if (!this.isFormValid()) {
        this.error.set(this.labels.checkout.validation.fixFields);
      }

      return;
    }

    this.processing.set(true);
    this.error.set(null);

    try {
      const order = await this.checkoutRepository.createOrder({
        eventId: eventDetail.event.id,
        userId: this.auth.currentUser().id,
        buyerName: this.buyerName().trim(),
        buyerEmail: this.buyerEmail().trim(),
        buyerPhone: this.buyerPhone().trim(),
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
        paymentReference: this.paymentReference().trim() || undefined,
        result,
      });

      await this.router.navigate([
        '/checkout',
        eventDetail.event.id,
        'confirmation',
        payment.order.id,
      ]);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : this.labels.checkout.errorTitle);
    } finally {
      this.processing.set(false);
    }
  }

  private async loadCheckout(eventId: string, queryParams: ParamMap): Promise<void> {
    const requestId = this.pageState.start();

    this.error.set(null);
    this.quantities.set({});

    try {
      const eventDetail = await this.eventsRepository.getEventById(eventId);

      if (!this.pageState.isCurrent(requestId)) {
        return;
      }

      this.eventDetail.set(eventDetail);

      if (!eventDetail) {
        return;
      }

      const restoredQuantities = eventDetail.ticketTypes.reduce<Record<string, number>>(
        (quantities, ticketType) => {
          const available = Math.max(ticketType.quantityTotal - ticketType.quantitySold, 0);
          const requestedQuantity = Number(queryParams.get(ticketType.id));

          if (
            ticketType.status === 'active' &&
            available > 0 &&
            Number.isFinite(requestedQuantity) &&
            requestedQuantity > 0
          ) {
            quantities[ticketType.id] = Math.min(Math.trunc(requestedQuantity), available);
          }

          return quantities;
        },
        {},
      );

      if (Object.keys(restoredQuantities).length > 0) {
        this.quantities.set(restoredQuantities);
        return;
      }

      const firstAvailableTicketType = eventDetail.ticketTypes.find(
        (ticketType) =>
          ticketType.status === 'active' && ticketType.quantityTotal > ticketType.quantitySold,
      );

      if (firstAvailableTicketType) {
        this.quantities.set({ [firstAvailableTicketType.id]: 1 });
      }
    } finally {
      this.pageState.finish(requestId);
    }
  }
}
