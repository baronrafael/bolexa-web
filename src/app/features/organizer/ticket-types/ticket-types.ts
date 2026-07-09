import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockAuth } from '../../../core/auth/mock-auth';
import { appLabels } from '../../../core/content/app-labels';
import { Currency, EventDetail, TicketType, TicketTypeStatus } from '../../../data-access/models';
import {
  OrganizerRepository,
  SaveTicketTypeInput,
} from '../../../data-access/repositories/organizer-repository';
import { formatMoneyEsVe } from '../../../shared/formatting/formatters';
import { createAsyncPageState } from '../../../shared/state/async-page-state';
import { EmptyState, LoadingState, StatusBadge } from '../../../shared/ui';

interface TicketTypeFormState {
  name: string;
  description: string;
  price: number;
  currency: Currency;
  quantityTotal: number;
  status: TicketTypeStatus;
}

@Component({
  selector: 'app-ticket-types',
  imports: [EmptyState, LoadingState, RouterLink, StatusBadge],
  templateUrl: './ticket-types.html',
  styleUrl: './ticket-types.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTypes {
  private readonly auth = inject(MockAuth);
  private readonly organizerRepository = inject(OrganizerRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.paramMap);
  private readonly pageState = createAsyncPageState();

  protected readonly labels = appLabels;
  protected readonly currencies: Currency[] = ['USD', 'VES'];
  protected readonly statuses: TicketTypeStatus[] = ['active', 'paused', 'sold_out'];
  protected readonly loading = this.pageState.loading;
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly notFound = this.pageState.notFound;
  protected readonly eventDetail = signal<EventDetail | null>(null);
  protected readonly editingTicketTypeId = signal<string | null>(null);
  protected readonly form = signal<TicketTypeFormState>(this.emptyForm());
  protected readonly eventId = computed(() => this.routeParams()?.get('eventId') ?? null);
  protected readonly organizerId = computed(() => this.auth.currentOrganizerId());
  protected readonly ticketTypes = computed(() => this.eventDetail()?.ticketTypes ?? []);
  protected readonly editingTicketType = computed(() => {
    const editingId = this.editingTicketTypeId();

    return editingId
      ? (this.ticketTypes().find((ticketType) => ticketType.id === editingId) ?? null)
      : null;
  });
  protected readonly formTitle = computed(() =>
    this.editingTicketTypeId()
      ? this.labels.organizerTicketTypes.formTitleEdit
      : this.labels.organizerTicketTypes.formTitleCreate,
  );
  protected readonly isValid = computed(() => {
    const form = this.form();
    const editingTicketType = this.editingTicketType();

    return Boolean(
      form.name.trim() &&
      Number.isFinite(form.price) &&
      form.price >= 0 &&
      Number.isInteger(form.quantityTotal) &&
      form.quantityTotal >= 0 &&
      (!editingTicketType || form.quantityTotal >= editingTicketType.quantitySold),
    );
  });

  constructor() {
    effect(() => {
      const organizerId = this.organizerId();
      const eventId = this.eventId();

      if (organizerId && eventId) {
        void this.loadEvent(organizerId, eventId);
      }
    });
  }

  protected updateField<K extends keyof TicketTypeFormState>(
    field: K,
    value: TicketTypeFormState[K],
  ): void {
    this.form.update((form) => ({ ...form, [field]: value }));
  }

  protected hasFieldError(
    field: keyof Pick<TicketTypeFormState, 'name' | 'price' | 'quantityTotal'>,
  ): boolean {
    if (!this.submitted()) {
      return false;
    }

    const form = this.form();

    if (field === 'name') {
      return !form.name.trim();
    }

    if (field === 'price') {
      return !Number.isFinite(form.price) || form.price < 0;
    }

    const editingTicketType = this.editingTicketType();

    return (
      !Number.isInteger(form.quantityTotal) ||
      form.quantityTotal < 0 ||
      Boolean(editingTicketType && form.quantityTotal < editingTicketType.quantitySold)
    );
  }

  protected edit(ticketType: TicketType): void {
    this.editingTicketTypeId.set(ticketType.id);
    this.submitted.set(false);
    this.form.set({
      name: ticketType.name,
      description: ticketType.description ?? '',
      price: ticketType.price,
      currency: ticketType.currency,
      quantityTotal: ticketType.quantityTotal,
      status: ticketType.status,
    });
  }

  protected cancelEdit(): void {
    this.editingTicketTypeId.set(null);
    this.submitted.set(false);
    this.form.set(this.emptyForm());
  }

  protected available(ticketType: TicketType): number {
    return Math.max(ticketType.quantityTotal - ticketType.quantitySold, 0);
  }

  protected revenue(ticketType: TicketType): string {
    return this.formatMoney(ticketType.price * ticketType.quantitySold, ticketType.currency);
  }

  protected formatMoney(value: number, currency: Currency): string {
    return formatMoneyEsVe(value, currency);
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);

    if (!this.isValid() || this.saving()) {
      return;
    }

    const organizerId = this.organizerId();
    const eventId = this.eventId();

    if (!organizerId || !eventId) {
      return;
    }

    this.saving.set(true);

    try {
      const editingId = this.editingTicketTypeId();
      const input = this.toSaveInput();
      const eventDetail = editingId
        ? await this.organizerRepository.updateTicketType(organizerId, eventId, editingId, input)
        : await this.organizerRepository.createTicketType(organizerId, eventId, input);

      this.eventDetail.set(eventDetail);
      this.cancelEdit();
    } finally {
      this.saving.set(false);
    }
  }

  private async loadEvent(organizerId: string, eventId: string): Promise<void> {
    const requestId = this.pageState.start();

    try {
      const eventDetail = await this.organizerRepository.getEvent(organizerId, eventId);

      if (!this.pageState.isCurrent(requestId)) {
        return;
      }

      this.eventDetail.set(eventDetail);
      this.pageState.setNotFound(requestId, !eventDetail);
      this.cancelEdit();
    } finally {
      this.pageState.finish(requestId);
    }
  }

  private toSaveInput(): SaveTicketTypeInput {
    const form = this.form();

    return {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      currency: form.currency,
      quantityTotal: form.quantityTotal,
      status: form.status,
    };
  }

  private emptyForm(): TicketTypeFormState {
    return {
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      quantityTotal: 100,
      status: 'active',
    };
  }
}
