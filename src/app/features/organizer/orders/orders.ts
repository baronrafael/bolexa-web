import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { OrderStatus, PaymentMethod } from '../../../data-access/models';
import { OrganizerOrder, OrganizerRepository } from '../../../data-access/repositories/organizer-repository';
import { formatDateEsVe, formatMoneyEsVe } from '../../../shared/formatting/formatters';
import { normalizeSearch } from '../../../shared/search/normalize-search';
import { EmptyState, LoadingState, SearchInput, StatusBadge } from '../../../shared/ui';

@Component({
  selector: 'app-orders',
  imports: [EmptyState, LoadingState, RouterLink, SearchInput, StatusBadge],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Orders {
  private readonly auth = inject(MockAuth);
  private readonly organizerRepository = inject(OrganizerRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.paramMap);
  private loadRequestId = 0;

  protected readonly labels = appLabels;
  protected readonly orderStatuses: OrderStatus[] = ['pending', 'paid', 'manual_review', 'cancelled', 'expired', 'refunded', 'failed'];
  protected readonly paymentMethods: PaymentMethod[] = ['pago_movil', 'zelle', 'binance', 'bank_transfer', 'manual', 'card'];
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly orders = signal<OrganizerOrder[]>([]);
  protected readonly eventTitle = signal('');
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<OrderStatus | ''>('');
  protected readonly paymentMethodFilter = signal<PaymentMethod | ''>('');
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly organizerId = computed(() => this.auth.currentOrganizerId());
  protected readonly filteredOrders = computed(() => {
    const query = normalizeSearch(this.searchQuery());
    const status = this.statusFilter();
    const paymentMethod = this.paymentMethodFilter();

    return this.orders().filter((entry) => {
      const searchable = normalizeSearch(`${entry.order.id} ${entry.buyer.name} ${entry.buyer.email}`);

      return (!query || searchable.includes(query))
        && (!status || entry.order.status === status)
        && (!paymentMethod || entry.order.paymentMethod === paymentMethod);
    });
  });

  constructor() {
    effect(() => {
      const organizerId = this.organizerId();
      const eventId = this.eventId();

      if (organizerId && eventId) {
        void this.loadOrders(organizerId, eventId);
      }
    });
  }

  protected updateStatusFilter(value: string): void {
    this.statusFilter.set(this.orderStatuses.includes(value as OrderStatus) ? value as OrderStatus : '');
  }

  protected updatePaymentMethodFilter(value: string): void {
    this.paymentMethodFilter.set(this.paymentMethods.includes(value as PaymentMethod) ? value as PaymentMethod : '');
  }

  protected paymentMethodLabel(paymentMethod?: PaymentMethod): string {
    return paymentMethod ? this.labels.checkout.paymentMethods[paymentMethod] : this.labels.organizerOrders.noPaymentMethod;
  }

  protected ticketCount(entry: OrganizerOrder): number {
    return entry.tickets.length;
  }

  protected itemCount(entry: OrganizerOrder): number {
    return entry.items.reduce((total, item) => total + item.quantity, 0);
  }

  protected formatDate(value: string): string {
    return formatDateEsVe(value, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  protected formatMoney(value: number, currency: string): string {
    return formatMoneyEsVe(value, currency);
  }

  private async loadOrders(organizerId: string, eventId: string): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.loading.set(true);
    this.notFound.set(false);

    try {
      const [eventDetail, orders] = await Promise.all([
        this.organizerRepository.getEvent(organizerId, eventId),
        this.organizerRepository.listEventOrders(organizerId, eventId),
      ]);

      if (requestId !== this.loadRequestId) {
        return;
      }

      this.notFound.set(!eventDetail);
      this.eventTitle.set(eventDetail?.event.title ?? '');
      this.orders.set(orders);
    } finally {
      if (requestId === this.loadRequestId) {
        this.loading.set(false);
      }
    }
  }
}
