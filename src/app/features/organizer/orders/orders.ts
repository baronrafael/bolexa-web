import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { OrderStatus, PaymentMethod } from '../../../data-access/models';
import { OrganizerOrder, OrganizerRepository } from '../../../data-access/repositories/organizer-repository';
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
  protected readonly organizerId = computed(() => {
    const currentUser = this.auth.currentUser();

    return currentUser.organizerId ?? this.auth.demoUsers().find((user) => user.role === 'organizer')?.organizerId ?? null;
  });
  protected readonly filteredOrders = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const paymentMethod = this.paymentMethodFilter();

    return this.orders().filter((entry) => {
      const searchable = `${entry.order.id} ${entry.buyer.name} ${entry.buyer.email}`.toLowerCase();

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
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  protected formatMoney(value: number, currency: string): string {
    return new Intl.NumberFormat('es-VE', {
      currency,
      style: 'currency',
    }).format(value);
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
